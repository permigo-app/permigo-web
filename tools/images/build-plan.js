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

// Trois modèles de rendu, choisis scène par scène :
//   1 = photo réaliste simple (par défaut — questions et cartes "1 concept")
//   2 = schéma pédagogique vu du dessus, flèches vertes/rouges + chiffres,
//       AUCUN MOT (site bilingue FR/NL — un mot gravé dans l'image ne se
//       traduit pas) — pour les règles à plusieurs acteurs / priorité / ordre
//   3 = hybride : photo réaliste + UN SEUL repère graphique (chiffre en badge
//       ou flèche unique, jamais de mot) — pour un repère chiffré isolé
const STYLE_BLOCKS = {
  1: `STYLE : photographie réaliste, type photo d'examen du permis de conduire belge (GOCA). ` +
     `Belgique, circulation à droite, lumière naturelle. ` +
     `Composition SIMPLE, lisible en 2 secondes, avec UN sujet principal clair. ` +
     `Aucun texte lisible et aucune enseigne (sauf si la scène l'exige explicitement), aucune flèche ajoutée, aucun filigrane. ` +
     `MARQUAGES ROUTIERS BELGES UNIQUEMENT : lignes BLANCHES (orange seulement pour les chantiers) — JAMAIS de ligne jaune au sol. ` +
     `N'ajoute AUCUN panneau de signalisation — uniquement ceux décrits dans la scène. Format paysage.`,
  2: `STYLE : SCHÉMA PÉDAGOGIQUE vu du dessus (vue aérienne stylisée et épurée, PAS une photographie), ` +
     `façon diagramme de code de la route. Utilise des FLÈCHES colorées pour montrer les trajectoires ` +
     `(vert = passe / autorisé, rouge = doit céder / interdit) et de simples CHIFFRES isolés (1, 2, 3…) ` +
     `pour indiquer un ordre de passage si nécessaire. N'ajoute AUCUN panneau de signalisation, AUCUN triangle, AUCUNE ligne au sol qui ne soit pas explicitement décrit dans la scène — n'invente aucun élément. INTERDIT ABSOLU : aucun mot écrit, aucune lettre, ` +
     `aucun panneau texté — le site est bilingue FR/NL, un mot gravé dans l'image ne peut pas être traduit. ` +
     `Fond clair et minimaliste, marquages routiers belges simplifiés, silhouettes de véhicules stylisées. Format paysage.`,
  3: `STYLE : photographie réaliste (même exigence qu'une photo d'examen GOCA belge, lumière naturelle, ` +
     `circulation à droite), à laquelle est ajouté UN SEUL repère graphique simple et discret : soit un ` +
     `chiffre isolé dans un petit badge circulaire, soit une flèche unique — jamais les deux ensemble, ` +
     `et JAMAIS de mot écrit (site bilingue FR/NL). Le repère ne doit pas transformer la photo en schéma : ` +
     `la scène doit rester lisible comme une vraie photo. Format paysage.`,
};

function buildPrompt(lic, themeTitle, sceneEntry, kind) {
  // Rétrocompatibilité : une scène simple (string) = modèle 1, comme avant.
  const model = typeof sceneEntry === 'object' && sceneEntry.model ? sceneEntry.model : 1;
  const scene = typeof sceneEntry === 'object' ? sceneEntry.scene : sceneEntry;
  const contexte = kind === 'card'
    ? `carte de théorie du permis ${lic === 'AM' ? 'AM (cyclomoteur)' : 'B (voiture)'} belge, thème « ${themeTitle} »`
    : `question d'examen du permis ${lic === 'AM' ? 'AM (cyclomoteur)' : 'B (voiture)'} belge, thème « ${themeTitle} »`;
  return `Génère une image.\n\n${STYLE_BLOCKS[model]}\n\n` +
    `SCÈNE PRÉCISE À REPRÉSENTER :\n${scene}\n\n` +
    `Contexte : ${contexte}.`;
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
          prompt: buildPrompt(lic, theme.title, scene, 'question'),
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
            prompt: buildPrompt(lic, theme.title, scenes[key], 'card'),
          });
        });
      });
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'plan.json'), JSON.stringify(jobs, null, 1));
console.log(`plan.json : ${jobs.length} images à produire (scènes rédigées à la main)`);
console.log(`ignorées : ${scenesNull} questions marquées "sans image" · ${noScene} en attente de scènes`);
