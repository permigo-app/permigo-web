// Construit plan.json : la liste ordonnée de toutes les images à produire.
// - Questions SANS panneau (sign) et SANS image existante
// - Cartes de théorie sans image existante
// Ordre : permis B thème A → I, puis permis AM thème A → F (questions avant cartes).
// Relançable à volonté : ce qui a déjà une image dans les données est exclu.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const SECTIONS = [
  { lic: 'B', codes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] },
  { lic: 'AM', codes: ['A', 'B', 'C', 'D', 'E', 'F'] },
];

function themeFile(lic, code) {
  return lic === 'AM' ? `src/data/am/theme_${code}.json` : `src/data/theme_${code}.json`;
}

function styleBlock(lic) {
  const pov = lic === 'AM'
    ? "du point de vue d'un conducteur de scooter (cyclomoteur) — le guidon peut être légèrement visible en bas de l'image"
    : "du point de vue d'un conducteur de voiture, à hauteur des yeux, à travers le pare-brise";
  return `Style : photographie réaliste ${pov}, en Belgique (circulation à droite), lumière de jour. ` +
    `Décor belge crédible : façades en briques, marquages routiers européens, plaques belges. ` +
    `IMPORTANT : aucun texte lisible, aucune flèche ajoutée, aucun panneau inventé, aucun filigrane, aucune interface. Format paysage.`;
}

function questionPrompt(lic, themeTitle, q) {
  return `Génère une image.\n\n${styleBlock(lic)}\n\n` +
    `Situation à illustrer — l'image doit MONTRER la scène décrite SANS révéler la bonne réponse :\n` +
    `« ${q.question} »\n\n` +
    `Contexte : question d'examen du permis ${lic === 'AM' ? 'AM (cyclomoteur)' : 'B (voiture)'} belge, thème « ${themeTitle} ».`;
}

function cardPrompt(lic, themeTitle, card) {
  // On illustre la règle de la carte (premier bloc 📋 si présent, sinon début du contenu)
  const m = card.content.match(/📋[^\n]*\n([\s\S]*?)(\n\n|$)/);
  const regle = (m ? m[1] : card.content).trim().slice(0, 350);
  return `Génère une image.\n\n${styleBlock(lic)}\n\n` +
    `Illustre concrètement cette règle du code de la route belge (scène typique, sans texte) :\n` +
    `« ${card.title} » — ${regle}\n\n` +
    `Contexte : carte de théorie du permis ${lic === 'AM' ? 'AM (cyclomoteur)' : 'B (voiture)'} belge, thème « ${themeTitle} ».`;
}

const jobs = [];
for (const { lic, codes } of SECTIONS) {
  for (const code of codes) {
    const file = themeFile(lic, code);
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) continue;
    const theme = JSON.parse(fs.readFileSync(abs, 'utf8'));

    // 1) Questions (sans panneau, sans image)
    for (const lesson of theme.lessons) {
      for (const q of lesson.questions) {
        if (q.sign || q.image) continue;
        jobs.push({
          kind: 'question',
          lic, theme: code, file,
          lessonId: lesson.id,
          id: q.id,
          label: q.question,
          out: `/images/questions/${q.id}.webp`,
          prompt: questionPrompt(lic, theme.title, q),
        });
      }
    }
    // 2) Cartes de théorie (sans image)
    for (const lesson of theme.lessons) {
      (lesson.theory || []).forEach((partie, pi) => {
        partie.cards.forEach((card, ci) => {
          if (card.image) return;
          const key = `${lic === 'AM' ? 'AM_' : ''}${lesson.id}_p${pi}_c${ci}`;
          jobs.push({
            kind: 'card',
            lic, theme: code, file,
            lessonId: lesson.id, partieIdx: pi, cardIdx: ci,
            id: key,
            label: card.title,
            out: `/images/theorie/${key}.webp`,
            prompt: cardPrompt(lic, theme.title, card),
          });
        });
      });
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'plan.json'), JSON.stringify(jobs, null, 1));
const byKind = jobs.reduce((a, j) => ((a[j.lic + ' ' + j.kind] = (a[j.lic + ' ' + j.kind] || 0) + 1), a), {});
console.log(`plan.json : ${jobs.length} images à produire`);
console.log(byKind);
