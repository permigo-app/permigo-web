// Fusionne un lot de traductions NL dans le fichier locale d'un thème.
// Usage: node scripts/merge-nl-translations.js <THEME> <LESSON_ID> <fichier_json_traductions>
const fs = require('fs');
const path = require('path');

const [, , THEME, LESSON, TRANS_PATH] = process.argv;
if (!THEME || !LESSON || !TRANS_PATH) {
  console.error('Usage: node merge-nl-translations.js <THEME> <LESSON_ID> <fichier.json>');
  process.exit(1);
}

const NL_PATH = path.join(__dirname, '..', 'src', 'locales', 'content', 'nl', `theme_${THEME}_nl.json`);
const nl = JSON.parse(fs.readFileSync(NL_PATH, 'utf8'));
const lesson = nl.lessons.find(l => l.id === LESSON);
if (!lesson) { console.error('Leçon introuvable:', LESSON); process.exit(1); }

const translations = JSON.parse(fs.readFileSync(TRANS_PATH, 'utf8'));
const existingIds = new Set(lesson.questions.map(q => q.id));

let added = 0, skipped = 0;
for (const t of translations) {
  if (existingIds.has(t.id)) { skipped++; continue; }
  lesson.questions.push({
    id: t.id,
    question: t.question,
    choices: t.choices,
    correct: t.correct,
    explanation: t.explanation,
    ...(t.theoryCardIndex !== undefined ? { theoryCardIndex: t.theoryCardIndex } : {}),
  });
  added++;
}

fs.writeFileSync(NL_PATH, JSON.stringify(nl, null, 2) + '\n');
console.log(`${LESSON} : ${added} traductions ajoutées, ${skipped} ignorées (déjà présentes). Total NL maintenant: ${lesson.questions.length}`);
