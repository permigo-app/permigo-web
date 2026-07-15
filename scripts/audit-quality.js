// Audit qualité structurel — détecte les défauts qu'une lecture superficielle
// laisse passer : choix malformés, réponse correcte dupliquée dans les choix,
// explication absente/trop courte, question-panneau sans code panneau,
// réponse correcte trop évidente par sa longueur/formulation.
const fs = require('fs');
const path = require('path');

const THEME = process.argv[2] || 'A';
const fr = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', `theme_${THEME}.json`), 'utf8'));

const issues = { malformed: [], dupChoice: [], noExplanation: [], shortExplanation: [], signlessVisual: [], giveaway: [], exactDupText: [] };

const SIGN_HINT_RE = /panneau|signal|signe\b|vous voyez ce|apercevez ce/i;
const seenQuestionText = new Map(); // texte normalisé -> [ids]

for (const lesson of fr.lessons) {
  for (const q of lesson.questions) {
    // Structure
    if (!Array.isArray(q.choices) || q.choices.length !== 4) issues.malformed.push(`${q.id} : ${q.choices?.length ?? 0} choix (attendu 4)`);
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) issues.malformed.push(`${q.id} : index correct invalide (${q.correct})`);

    // Doublon de texte dans les choix eux-mêmes
    if (Array.isArray(q.choices)) {
      const norm = q.choices.map(c => (c || '').trim().toLowerCase());
      const dupes = norm.filter((c, i) => norm.indexOf(c) !== i);
      if (dupes.length > 0) issues.dupChoice.push(`${q.id} : choix en double ("${dupes[0]}")`);
    }

    // Explication
    if (!q.explanation || !q.explanation.trim()) issues.noExplanation.push(`${q.id} : aucune explication`);
    else if (q.explanation.trim().length < 15) issues.shortExplanation.push(`${q.id} : explication trop courte ("${q.explanation}")`);

    // Question qui parle d'un panneau/signal mais sans code sign
    if (!q.sign && SIGN_HINT_RE.test(q.question) && /panneau|signal/i.test(q.question)) {
      // Exclut les questions théoriques qui MENTIONNENT un panneau sans en montrer un précis
      issues.signlessVisual.push(`${q.id} : "${q.question.slice(0, 70)}" — référence un panneau mais aucun code 'sign'`);
    }

    // Réponse correcte qui se distingue trop (mot-clé unique donnant la réponse)
    if (Array.isArray(q.choices) && typeof q.correct === 'number') {
      const correctText = (q.choices[q.correct] || '');
      const correctLen = correctText.length;
      const others = q.choices.filter((_, i) => i !== q.correct);
      const avgOtherLen = others.reduce((s, c) => s + (c?.length ?? 0), 0) / (others.length || 1);
      if (correctLen > avgOtherLen * 2.2 && correctLen > 40) {
        issues.giveaway.push(`${q.id} : la bonne réponse est ${Math.round(correctLen / avgOtherLen * 10) / 10}x plus longue que les autres (repérable sans connaître la règle)`);
      }
    }

    // Texte de question strictement identique à une autre (hors "Que signifie ce panneau ?" générique)
    const normQ = q.question.trim().toLowerCase();
    if (normQ !== 'que signifie ce panneau ?' && normQ.length > 20) {
      if (seenQuestionText.has(normQ)) {
        issues.exactDupText.push(`${q.id} ≡ ${seenQuestionText.get(normQ)} : texte de question identique`);
      } else {
        seenQuestionText.set(normQ, q.id);
      }
    }
  }
}

let report = `# Audit qualité — Thème ${THEME}\n\n`;
for (const [key, list] of Object.entries(issues)) {
  const titles = {
    malformed: 'Structure malformée (choix ≠ 4 ou index invalide)',
    dupChoice: 'Réponse dupliquée dans les choix de la même question',
    noExplanation: 'Explication absente',
    shortExplanation: 'Explication suspicieusement courte',
    signlessVisual: 'Question référençant un panneau sans code "sign"',
    giveaway: 'Bonne réponse "devinable" (trop longue/détaillée vs les autres)',
    exactDupText: 'Texte de question strictement identique à une autre',
  };
  report += `## ${titles[key]} (${list.length})\n\n`;
  report += list.length ? list.map(x => `- ${x}`).join('\n') : '_Aucun_';
  report += '\n\n';
}

fs.writeFileSync(path.join(__dirname, '..', 'docs', `audit-qualite-${THEME}.md`), report);
const total = Object.values(issues).reduce((s, l) => s + l.length, 0);
console.log(`Audit thème ${THEME} : ${total} signalements → docs/audit-qualite-${THEME}.md`);
for (const [k, l] of Object.entries(issues)) console.log(' ', k, ':', l.length);
