const fs = require('fs');
const path = require('path');
const TO_DELETE = ['A2_Q57', 'A5_Q30', 'A5_Q35', 'A6_Q36', 'A6_Q94'];
const THEME_PATH = path.join(__dirname, '..', 'src', 'data', 'theme_A.json');
const fr = JSON.parse(fs.readFileSync(THEME_PATH, 'utf8'));
let removed = 0;
for (const lesson of fr.lessons) {
  const before = lesson.questions.length;
  lesson.questions = lesson.questions.filter(q => !TO_DELETE.includes(q.id));
  removed += before - lesson.questions.length;
}
fs.writeFileSync(THEME_PATH, JSON.stringify(fr, null, 2) + '\n');
console.log('Supprimées:', removed, '/ 5 attendues');
