// Génère un checklist markdown de tous les points théoriques (cartes) de
// chaque thème, avec l'identifiant exact attendu comme nom de fichier image
// (ex: A1_P1_1.png), et coche celles déjà présentes dans public/images/theory.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'theory');
const OUT_FILE = path.join(ROOT, 'docs', 'points-theoriques-images.md');

const THEMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const existingImages = new Set(
  fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''))
);

let out = '# Checklist images théoriques — MyPermiGo\n\n';
out += `Généré automatiquement depuis src/data/theme_*.json.\n\n`;
out += `**Convention de nommage** : sauvegarde chaque image sous \`{ID}.png\` dans \`public/images/theory/\` (ex: \`B1_P1_1.png\`). L'ID est indiqué entre parenthèses devant chaque point.\n\n`;

let totalCards = 0;
let totalDone = 0;
const themeStats = [];

for (const code of THEMES) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `theme_${code}.json`), 'utf8'));
  out += `\n## Thème ${code} — ${d.title}\n`;
  let themeCards = 0, themeDone = 0;

  for (const lesson of d.lessons) {
    out += `\n### ${lesson.id} — ${lesson.title}\n`;
    for (const part of lesson.theory) {
      out += `\n**${part.title}**\n\n`;
      part.cards.forEach((card, i) => {
        const id = `${lesson.id}_P${lesson.theory.indexOf(part) + 1}_${i + 1}`;
        const done = existingImages.has(id);
        totalCards++; themeCards++;
        if (done) { totalDone++; themeDone++; }
        out += `- [${done ? 'x' : ' '}] \`${id}\` — ${card.title}\n`;
      });
    }
  }
  themeStats.push(`- Thème ${code} (${d.title}) : ${themeDone}/${themeCards}`);
}

const header = `\n---\n\n## Résumé\n\nTotal : ${totalDone}/${totalCards} images présentes.\n\n${themeStats.join('\n')}\n\n---\n`;
out = out.replace('\n## Thème A', header + '\n## Thème A');

fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(OUT_FILE, out, 'utf8');
console.log('Écrit:', OUT_FILE);
console.log('Total:', totalDone, '/', totalCards);
