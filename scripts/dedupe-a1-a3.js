// Applique les 3 suppressions de doublons confirmées (A1, A3) + merge du
// code panneau D10 dans A3_Q5 avant de supprimer son doublon A3_Q68.
// Synchronise theme_A.json (FR), le fichier NL s'il contient ces IDs, et
// panneaux_quiz.json s'il les contient aussi.
const fs = require('fs');
const path = require('path');

const TO_DELETE = ['A1Q86', 'A3_Q68', 'A3_Q44'];
const THEME_PATH = path.join(__dirname, '..', 'src', 'data', 'theme_A.json');
const NL_PATH = path.join(__dirname, '..', 'src', 'locales', 'content', 'nl', 'theme_A_nl.json');
const PANNEAUX_PATH = path.join(__dirname, '..', 'src', 'data', 'panneaux_quiz.json');

const fr = JSON.parse(fs.readFileSync(THEME_PATH, 'utf8'));

// Merge : A3_Q5 récupère le code panneau D10 de A3_Q68 avant sa suppression
const a3 = fr.lessons.find(l => l.id === 'A3');
const q5 = a3.questions.find(q => q.id === 'A3_Q5');
if (!q5.sign) { q5.sign = 'D10'; console.log('A3_Q5 : code panneau D10 ajouté.'); }

let removedFr = 0;
for (const lesson of fr.lessons) {
  const before = lesson.questions.length;
  lesson.questions = lesson.questions.filter(q => !TO_DELETE.includes(q.id));
  removedFr += before - lesson.questions.length;
}
fs.writeFileSync(THEME_PATH, JSON.stringify(fr, null, 2) + '\n');
console.log('theme_A.json : ', removedFr, 'questions supprimées.');

// NL
if (fs.existsSync(NL_PATH)) {
  const nl = JSON.parse(fs.readFileSync(NL_PATH, 'utf8'));
  let removedNl = 0;
  for (const lesson of nl.lessons) {
    const before = (lesson.questions || []).length;
    lesson.questions = (lesson.questions || []).filter(q => !TO_DELETE.includes(q.id));
    removedNl += before - lesson.questions.length;
  }
  fs.writeFileSync(NL_PATH, JSON.stringify(nl, null, 2) + '\n');
  console.log('theme_A_nl.json : ', removedNl, 'questions supprimées (si présentes).');
}

// panneaux_quiz.json
const pq = JSON.parse(fs.readFileSync(PANNEAUX_PATH, 'utf8'));
let removedPq = 0;
for (const cat of pq.categories) {
  const before = cat.questions.length;
  cat.questions = cat.questions.filter(q => !TO_DELETE.includes(q.id));
  removedPq += before - cat.questions.length;
}
if (removedPq > 0) {
  fs.writeFileSync(PANNEAUX_PATH, JSON.stringify(pq, null, 2) + '\n');
  console.log('panneaux_quiz.json : ', removedPq, 'questions supprimées.');
} else {
  console.log('panneaux_quiz.json : aucune de ces questions n\'y était présente.');
}
