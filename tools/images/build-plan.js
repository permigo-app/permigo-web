// Construit plan.json à partir des SCÈNES CONÇUES À LA MAIN (tools/images/scenes/).
//
// Principe : plus aucun prompt générique. Chaque image du plan a une scène
// rédigée question par question (en analysant l'énoncé, les 4 propositions et
// la bonne réponse). Une question absente des fichiers de scènes — ou marquée
// null (= image inutile/trompeuse) — n'entre PAS dans le plan.
//
// Fichiers de scènes : scenes/theme_X.json (permis B), scenes/am_theme_X.json (permis AM)
//   { "A1Q17": "description précise de la scène …", "A1_Q1": null, … }
//
// Relançable à volonté : ce qui a déjà une image dans les données est exclu.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCENES_DIR = path.join(__dirname, 'scenes');

const SECTIONS = [
  { lic: 'B', codes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], dataFile: c => `src/data/theme_${c}.json`, sceneFile: c => `theme_${c}.json` },
  { lic: 'AM', codes: ['A', 'B', 'C', 'D', 'E', 'F'], dataFile: c => `src/data/am/theme_${c}.json`, sceneFile: c => `am_theme_${c}.json` },
];

function buildPrompt(lic, themeTitle, scene) {
  return `Génère une image.\n\n` +
    `STYLE : photographie réaliste, type photo d'examen du permis de conduire belge (GOCA). ` +
    `Belgique, circulation à droite, lumière naturelle. ` +
    `Composition SIMPLE, lisible en 2 secondes, avec UN sujet principal clair. ` +
    `Aucun texte lisible et aucune enseigne (sauf si la scène l'exige explicitement), aucune flèche ajoutée, aucun filigrane. ` +
    `N'ajoute AUCUN panneau de signalisation — uniquement ceux décrits dans la scène. Format paysage.\n\n` +
    `SCÈNE PRÉCISE À REPRÉSENTER :\n${scene}\n\n` +
    `Contexte : question d'examen du permis ${lic === 'AM' ? 'AM (cyclomoteur)' : 'B (voiture)'} belge, thème « ${themeTitle} ».`;
}

const jobs = [];
let scenesNull = 0, noScene = 0;

for (const { lic, codes, dataFile, sceneFile } of SECTIONS) {
  for (const code of codes) {
    const dataAbs = path.join(ROOT, dataFile(code));
    const scenesAbs = path.join(SCENES_DIR, sceneFile(code));
    if (!fs.existsSync(dataAbs) || !fs.existsSync(scenesAbs)) continue;
    const theme = JSON.parse(fs.readFileSync(dataAbs, 'utf8'));
    const scenes = JSON.parse(fs.readFileSync(scenesAbs, 'utf8'));

    for (const lesson of theme.lessons) {
      for (const q of lesson.questions) {
        if (q.sign || q.image) continue; // panneau = déjà un visuel ; image = déjà fait
        if (!(q.id in scenes)) { noScene++; continue; } // scène pas encore rédigée
        const scene = scenes[q.id];
        if (scene === null) { scenesNull++; continue; } // décision : pas d'image pour celle-ci
        jobs.push({
          kind: 'question',
          lic, theme: code, file: dataFile(code),
          lessonId: lesson.id,
          id: q.id,
          label: q.question,
          out: `/images/questions/${q.id}.webp`,
          prompt: buildPrompt(lic, theme.title, scene),
        });
      }
      // Cartes de théorie : mêmes fichiers de scènes, clés "CARD_<lessonId>_p<i>_c<j>"
      (lesson.theory || []).forEach((partie, pi) => {
        partie.cards.forEach((card, ci) => {
          if (card.image) return;
          const key = `CARD_${lesson.id}_p${pi}_c${ci}`;
          if (!(key in scenes) || scenes[key] === null) return;
          jobs.push({
            kind: 'card',
            lic, theme: code, file: dataFile(code),
            lessonId: lesson.id, partieIdx: pi, cardIdx: ci,
            id: `${lic === 'AM' ? 'AM_' : ''}${key}`,
            label: card.title,
            out: `/images/theorie/${lic === 'AM' ? 'AM_' : ''}${lesson.id}_p${pi}_c${ci}.webp`,
            prompt: buildPrompt(lic, theme.title, scenes[key]),
          });
        });
      });
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'plan.json'), JSON.stringify(jobs, null, 1));
console.log(`plan.json : ${jobs.length} images à produire (scènes rédigées à la main)`);
console.log(`ignorées : ${scenesNull} questions marquées "sans image" · ${noScene} en attente de scènes`);
