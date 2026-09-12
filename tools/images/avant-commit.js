// AVANT-COMMIT — à lancer systématiquement avant de committer / déployer.
//
//   node tools/images/avant-commit.js
//
// Pourquoi : préparer un thème pour l'atelier (reprendre.js) efface le champ "image"
// des illustrations à refaire. Le fichier .webp reste sur le disque, mais plus rien
// ne le référence : tant que la nouvelle image n'est pas produite, le site n'affiche
// plus rien à cet endroit. Committer dans cet état publierait un site amputé.
//
// Ce script remet le champ "image" partout où le fichier existe réellement. Le site
// montre donc l'ancienne illustration plutôt que rien, et la nouvelle prend sa place
// au même chemin dès qu'elle est produite — aucun autre changement n'est nécessaire.
//
// Après le commit, relance simplement :
//   node tools/images/reprendre.js <THÈME> --write   puis   node tools/images/build-plan.js
// pour remettre au plan ce qu'il reste à produire (les images déjà reproduites sont
// reconnues via state.json et ne sont jamais remises à faire).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const THEMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

let cartes = 0, questions = 0, casses = 0;

for (const t of THEMES) {
  const p = path.join(ROOT, `src/data/theme_${t}.json`);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
  let c = 0, q = 0;

  for (const lesson of data.lessons) {
    (lesson.theory || []).forEach((partie, pi) => {
      (partie.cards || []).forEach((card, ci) => {
        if (card.image) return;
        const rel = `/images/theorie/${lesson.id}_p${pi}_c${ci}.webp`;
        if (fs.existsSync(path.join(ROOT, 'public', rel.slice(1)))) { card.image = rel; c++; }
      });
    });
    for (const question of lesson.questions || []) {
      if (question.image) continue;
      const rel = `/images/questions/${question.id}.webp`;
      if (fs.existsSync(path.join(ROOT, 'public', rel.slice(1)))) { question.image = rel; q++; }
    }
  }

  if (c || q) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  thème ${t} : ${String(c).padStart(3)} cartes + ${String(q).padStart(3)} questions rendues au site`);
  }
  cartes += c; questions += q;
}

// Contrôle : plus aucun champ "image" ne doit pointer vers un fichier absent.
for (const t of THEMES) {
  const p = path.join(ROOT, `src/data/theme_${t}.json`);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
  const check = img => { if (img && !fs.existsSync(path.join(ROOT, 'public', img.slice(1)))) { console.log(`  ⚠ fichier absent : ${img}`); casses++; } };
  for (const lesson of data.lessons) {
    (lesson.theory || []).forEach(pa => (pa.cards || []).forEach(c => check(c.image)));
    (lesson.questions || []).forEach(q => check(q.image));
  }
}

console.log('');
console.log(`  ${cartes + questions} illustrations rendues au site (${cartes} cartes, ${questions} questions)`);
console.log(casses ? `  ⚠ ${casses} images cassées — NE PAS COMMITTER EN L'ÉTAT` : '  aucune image cassée — bon pour le commit');
console.log('');
