// Corrige les 41 questions orphelines de A1 (ex-P6/P7) :
// 1. Assigne le bon code panneau aux 24 qui n'en avaient aucun (vérifié contre lib/signsData.ts)
// 2. Retire le theoryCardIndex invalide (5/6) — comme les 53 déjà migrées vers panneaux_quiz.json
// 3. Ajoute les 41 à panneaux_quiz.json (catégorie A) si pas déjà présentes
const fs = require('fs');
const path = require('path');

const THEME_PATH = path.join(__dirname, '..', 'src', 'data', 'theme_A.json');
const PANNEAUX_PATH = path.join(__dirname, '..', 'src', 'data', 'panneaux_quiz.json');

const SIGN_FIXES = {
  A1Q63: 'A1b', A1Q64: 'A1a', A1Q65: 'A1c', A1Q66: 'A1d',
  A1Q67: 'A3', A1Q68: 'A5', A1Q69: 'A19', A1Q70: 'A17',
  A1Q88: 'A19', A1Q89: 'A15', A1Q90: 'A3', A1Q91: 'A31',
  A1Q92: 'A9', A1Q93: 'A37', A1Q94: 'A7a', A1Q95: 'A29',
  A1Q96: 'A27', A1Q97: 'A13', A1Q98: 'F45', A1Q99: 'F45b',
  A1Q100: 'F23a', A1Q101: 'F45', A1Q102: 'F45b', A1Q103: 'F45b',
};

const fr = JSON.parse(fs.readFileSync(THEME_PATH, 'utf8'));
const a1 = fr.lessons.find(l => l.id === 'A1');
const orphans = a1.questions.filter(q => q.theoryCardIndex !== undefined && q.theoryCardIndex >= a1.theory.length);

console.log('Orphelines trouvées:', orphans.length);

let signsFixed = 0;
for (const q of orphans) {
  if (!q.sign && SIGN_FIXES[q.id]) {
    q.sign = SIGN_FIXES[q.id];
    signsFixed++;
  }
  delete q.theoryCardIndex; // retire l'index invalide — cohérent avec les 53 déjà migrées
}
console.log('Codes panneau assignés:', signsFixed, '/', Object.keys(SIGN_FIXES).length);

const stillNoSign = orphans.filter(q => !q.sign);
if (stillNoSign.length > 0) {
  console.error('❌ ERREUR: questions encore sans sign:', stillNoSign.map(q => q.id));
  process.exit(1);
}

fs.writeFileSync(THEME_PATH, JSON.stringify(fr, null, 2) + '\n');
console.log('theme_A.json mis à jour.');

// ── Ajout à panneaux_quiz.json (catégorie A) ──
const pq = JSON.parse(fs.readFileSync(PANNEAUX_PATH, 'utf8'));
const catA = pq.categories.find(c => c.id === 'A');
const existingIds = new Set(catA.questions.map(q => q.id));

let added = 0;
for (const q of orphans) {
  if (existingIds.has(q.id)) continue; // déjà présente, ne pas dupliquer
  catA.questions.push({
    id: q.id,
    sign: q.sign,
    question: q.question,
    answers: q.choices,
    correct: q.correct,
    explanation: q.explanation,
  });
  added++;
}
fs.writeFileSync(PANNEAUX_PATH, JSON.stringify(pq, null, 2) + '\n');
console.log('panneaux_quiz.json : ', added, 'questions ajoutées à la catégorie A (', catA.questions.length, 'au total maintenant).');
