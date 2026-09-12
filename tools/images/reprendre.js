// REPRENDRE — remet au plan les images signalées par l'audit visuel.
//
// Quatre fichiers de scènes réécrites :
//   scenes/theorie-a-refaire.json    →  25 cartes de théorie fausses ou illisibles
//   scenes/theorie-a-ameliorer.json  → 161 cartes de théorie faibles
//   scenes/a-refaire.json            →  63 questions fausses ou contradictoires
//   scenes/a-ameliorer.json          → 202 questions faibles
//
// ORDRE DE TRAVAIL : thème par thème, et dans chaque thème LA THÉORIE D'ABORD,
// PUIS LES QUESTIONS. On termine le thème A entièrement avant de passer au B.
// (build-plan.js range le plan dans ce même ordre, donc atelier.js le suit tout seul.)
//
//   node tools/images/reprendre.js                       → état des lieux, tous thèmes
//   node tools/images/reprendre.js A                     → simulation du thème A
//   node tools/images/reprendre.js A --write             → applique le thème A
//   node tools/images/reprendre.js A --theorie --write   → thème A, théorie seulement
//   node tools/images/reprendre.js A --questions --write → thème A, questions seulement
//
// Pour chaque image visée : la scène est réécrite dans scenes/theme_X.json et le champ
// "image" est effacé dans les données, pour que build-plan.js la remette au plan.
//
// Attention : effacer le champ "image" retire l'illustration actuelle sur le site tant que
// la nouvelle n'est pas produite. À lancer juste avant une session de génération — d'où
// l'intérêt d'avancer thème par thème plutôt que tout d'un coup.
//
// Enchaînement complet pour un thème :
//   node tools/images/reprendre.js A --write
//   node tools/images/build-plan.js
//   node tools/images/atelier.js loop        (ou double-clic sur ATELIER.bat)
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCENES_DIR = path.join(__dirname, 'scenes');
const ORDRE = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const THEME = (args.find(a => /^[A-I]$/i.test(a)) || '').toUpperCase() || null;
const ONLY_THEO = args.includes('--theorie');
const ONLY_QUEST = args.includes('--questions');

const read = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
const load = f => {
  const abs = path.join(SCENES_DIR, f);
  if (!fs.existsSync(abs)) return {};
  const j = read(abs); delete j._README; return j;
};

// Les scènes de théorie sont indexées par NOM DE FICHIER image (sans extension),
// celles des questions par identifiant de question.
const theoRefaire = ONLY_QUEST ? {} : load('theorie-a-refaire.json');
const theoAmel    = ONLY_QUEST ? {} : load('theorie-a-ameliorer.json');
const questRefaire = ONLY_THEO ? {} : load('a-refaire.json');
const questAmel    = ONLY_THEO ? {} : load('a-ameliorer.json');

const rattachees = new Set();
const codes = ORDRE.filter(c => !THEME || c === THEME);
const tot = { tR: 0, tA: 0, tImg: 0, qR: 0, qA: 0, qImg: 0 };

console.log('');
for (const code of codes) {
  const scenesAbs = path.join(SCENES_DIR, `theme_${code}.json`);
  const dataAbs = path.join(ROOT, `src/data/theme_${code}.json`);
  if (!fs.existsSync(scenesAbs) || !fs.existsSync(dataAbs)) continue;

  const scenes = read(scenesAbs);
  const data = read(dataAbs);
  let tR = 0, tA = 0, tImg = 0, qR = 0, qA = 0, qImg = 0;

  // --- 1. LA THÉORIE D'ABORD ---
  for (const lesson of data.lessons) {
    (lesson.theory || []).forEach((partie, pi) => {
      (partie.cards || []).forEach((card, ci) => {
        if (!card.image) return;
        const base = card.image.split('/').pop().replace(/\.webp$/, '');
        const estRefaire = theoRefaire[base] !== undefined;
        const scene = estRefaire ? theoRefaire[base] : theoAmel[base];
        if (scene === undefined) return;
        scenes[`CARD_${lesson.id}_p${pi}_c${ci}`] = scene;
        rattachees.add(base);
        estRefaire ? tR++ : tA++;
        delete card.image;
        tImg++;
      });
    });
  }

  // --- 2. PUIS LES QUESTIONS ---
  for (const lesson of data.lessons) {
    for (const q of lesson.questions) {
      const estRefaire = questRefaire[q.id] !== undefined;
      const scene = estRefaire ? questRefaire[q.id] : questAmel[q.id];
      if (scene === undefined) continue;
      scenes[q.id] = scene;
      rattachees.add(q.id);
      estRefaire ? qR++ : qA++;
      if (q.image) { delete q.image; qImg++; }
    }
  }

  if (WRITE && (tImg || qImg)) {
    fs.writeFileSync(scenesAbs, JSON.stringify(scenes, null, 2) + '\n', 'utf8');
    fs.writeFileSync(dataAbs, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }

  if (tImg || qImg) {
    console.log(`  THÈME ${code}`);
    console.log(`    1. théorie   ${String(tR).padStart(3)} à refaire · ${String(tA).padStart(3)} à améliorer   →  ${String(tImg).padStart(3)} images`);
    console.log(`    2. questions ${String(qR).padStart(3)} à refaire · ${String(qA).padStart(3)} à améliorer   →  ${String(qImg).padStart(3)} images`);
  }
  tot.tR += tR; tot.tA += tA; tot.tImg += tImg;
  tot.qR += qR; tot.qA += qA; tot.qImg += qImg;
}

console.log('');
console.log(WRITE ? '  APPLIQUÉ' : '  SIMULATION — ajoute --write pour appliquer');
console.log(`    théorie   : ${tot.tR} + ${tot.tA} = ${tot.tImg}`);
console.log(`    questions : ${tot.qR} + ${tot.qA} = ${tot.qImg}`);
console.log(`    TOTAL     : ${tot.tImg + tot.qImg} images à reproduire`);

if (!THEME) {
  const toutes = [...Object.keys(theoRefaire), ...Object.keys(theoAmel),
                  ...Object.keys(questRefaire), ...Object.keys(questAmel)];
  const orphelines = toutes.filter(k => !rattachees.has(k));
  if (orphelines.length) console.log(`    clés non rattachées : ${orphelines.join(', ')}`);
}
if (!WRITE) {
  console.log('');
  console.log('    Ensuite : node tools/images/build-plan.js   puis  node tools/images/atelier.js loop');
}
console.log('');
