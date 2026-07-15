// Analyse de la banque de questions : doublons potentiels + couverture
// des points théoriques. LECTURE SEULE — produit docs/rapport-questions.md.
// Usage: node scripts/analyse-questions.js
const fs = require('fs');
const path = require('path');

const THEMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const SIM_THRESHOLD = 0.62; // Jaccard sur tokens — au-dessus = doublon potentiel

const STOPWORDS = new Set(('le la les de du des un une au aux vous votre vos est sont sur pour que qui quoi quel quelle quels quelles en et a à dans il elle ne pas plus avec ce cette ces se sa son ses par ou où si comme mais donc or ni car tu te ta ton tes nous notre nos ils elles lorsque quand doit doivent peut peuvent être avoir fait faire je suis vrai faux').split(' '));

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

function jaccard(aTokens, bTokens) {
  const a = new Set(aTokens), b = new Set(bTokens);
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

// Union-Find pour regrouper les paires similaires en clusters
function clusterize(items, pairs) {
  const parent = items.map((_, i) => i);
  const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (const [i, j] of pairs) parent[find(i)] = find(j);
  const groups = new Map();
  items.forEach((_, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(i);
  });
  return [...groups.values()].filter(g => g.length > 1);
}

let report = '# Rapport d\'analyse des questions — MyPermiGo\n\n';
report += '_Généré automatiquement. Aucune modification effectuée — ce rapport sert à valider le triage._\n\n';

const summary = [];
let grandTotal = 0, grandDupQuestions = 0, grandClusters = 0;
const coverageGaps = [], coverageOverload = [];

for (const code of THEMES) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', `theme_${code}.json`), 'utf8'));
  let themeReport = `\n---\n\n## Thème ${code} — ${data.title}\n`;
  let themeDup = 0, themeClusters = 0, themeTotal = 0;

  for (const lesson of data.lessons) {
    const qs = lesson.questions;
    themeTotal += qs.length;
    grandTotal += qs.length;

    // ── Doublons : similarité intra-leçon ──
    const tokens = qs.map(q => normalize(q.question + ' ' + q.choices[q.correct]));
    const pairs = [];
    for (let i = 0; i < qs.length; i++) {
      for (let j = i + 1; j < qs.length; j++) {
        if (jaccard(tokens[i], tokens[j]) >= SIM_THRESHOLD) pairs.push([i, j]);
      }
    }
    const clusters = clusterize(qs, pairs);
    if (clusters.length > 0) {
      themeReport += `\n### ${lesson.id} — ${lesson.title} : ${clusters.length} groupe(s) de doublons potentiels\n`;
      for (const cluster of clusters) {
        themeClusters++;
        grandClusters++;
        themeDup += cluster.length;
        grandDupQuestions += cluster.length;
        themeReport += `\n**Groupe (${cluster.length} questions — à réduire à 1 ou 2)**\n\n`;
        for (const idx of cluster) {
          const q = qs[idx];
          themeReport += `- \`${q.id}\` (carte théorie ${q.theoryCardIndex ?? '?'}) : ${q.question}\n`;
          themeReport += `  - ✅ ${q.choices[q.correct]}\n`;
        }
      }
    }

    // ── Couverture : questions par PARTIE (theoryCardIndex = index de partie,
    // cf. getQuestionsForPartie dans lecon/[id]/page.tsx) ──
    const totalParties = lesson.theory.length;
    const byPartie = new Map();
    let outOfRange = 0;
    for (const q of qs) {
      const k = q.theoryCardIndex;
      if (k === undefined) { byPartie.set(-1, (byPartie.get(-1) ?? 0) + 1); continue; }
      if (k >= totalParties) { outOfRange++; continue; }
      byPartie.set(k, (byPartie.get(k) ?? 0) + 1);
    }
    const hasIndexed = qs.some(q => q.theoryCardIndex !== undefined);
    if (hasIndexed) {
      for (let pi = 0; pi < totalParties; pi++) {
        const n = byPartie.get(pi) ?? 0;
        const partieTitle = lesson.theory[pi].title;
        if (n === 0) coverageGaps.push(`🔴 BLOQUANT — ${lesson.id} partie ${pi + 1} (« ${partieTitle} ») : AUCUNE question → quiz vide, partie invalidable, médaille Or impossible`);
        else if (n < 3) coverageGaps.push(`🟡 ${lesson.id} partie ${pi + 1} : seulement ${n} question(s) — trop peu pour un quiz de validation à 90%`);
        if (n >= 12) coverageOverload.push(`${lesson.id} partie ${pi + 1} : ${n} questions (à élaguer)`);
      }
    }
    if (outOfRange > 0) coverageGaps.push(`🟠 ${lesson.id} : ${outOfRange} questions avec index HORS LIMITES (partie inexistante) — jamais servies en mode partie`);
    const unassigned = byPartie.get(-1) ?? 0;
    if (hasIndexed && unassigned > 0) coverageGaps.push(`ℹ️ ${lesson.id} : ${unassigned} questions sans partie assignée (utilisées seulement en examen/réflexe)`);
  }

  summary.push({ code, title: data.title, total: themeTotal, clusters: themeClusters, dup: themeDup });
  report += themeReport;
}

// ── Résumé en tête ──
let head = '## Résumé\n\n';
head += `- **${grandTotal} questions** analysées\n`;
head += `- **${grandClusters} groupes de doublons potentiels** impliquant **${grandDupQuestions} questions**\n`;
head += `- Économie estimée si on garde 1-2 par groupe : ~**${grandDupQuestions - grandClusters * 2} questions supprimables**\n`;
head += `- **${coverageGaps.length} problèmes de couverture** (points sans question ou questions orphelines)\n`;
head += `- **${coverageOverload.length} cartes surchargées** (6+ questions)\n\n`;
head += '| Thème | Questions | Groupes doublons | Questions dans doublons |\n|---|---|---|---|\n';
for (const s of summary) head += `| ${s.code} — ${s.title} | ${s.total} | ${s.clusters} | ${s.dup} |\n`;

head += '\n### Points théoriques sans aucune question (trous à combler)\n\n';
head += coverageGaps.length ? coverageGaps.map(g => `- ${g}`).join('\n') : '_Aucun_';
head += '\n\n### Cartes surchargées (6+ questions)\n\n';
head += coverageOverload.length ? coverageOverload.map(g => `- ${g}`).join('\n') : '_Aucune_';
head += '\n';

report = report.replace('_Généré automatiquement. Aucune modification effectuée — ce rapport sert à valider le triage._\n\n',
  '_Généré automatiquement. Aucune modification effectuée — ce rapport sert à valider le triage._\n\n' + head);

fs.writeFileSync(path.join(__dirname, '..', 'docs', 'rapport-questions.md'), report);
console.log('Rapport écrit : docs/rapport-questions.md');
console.log(`${grandTotal} questions | ${grandClusters} groupes de doublons | ${grandDupQuestions} questions concernées`);
console.log(`Trous de couverture : ${coverageGaps.length} | Cartes surchargées : ${coverageOverload.length}`);
