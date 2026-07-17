// Atelier images — boucle de production avec ChatGPT Plus (zéro API, zéro coût).
//
//   node atelier.js            → affiche le prompt courant + le copie dans le presse-papiers
//   node atelier.js take       → prend l'image la plus récente de Téléchargements,
//                                la convertit en WebP, l'installe dans le site,
//                                met à jour le JSON du thème, passe à la suivante
//   node atelier.js take <fichier>  → pareil avec un fichier précis
//   node atelier.js skip       → passe la question courante sans image
//   node atelier.js status     → avancement global
//
// Boucle : node atelier.js → coller dans ChatGPT → télécharger l'image → node atelier.js take
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PLAN = path.join(__dirname, 'plan.json');
const STATE = path.join(__dirname, 'state.json');

if (!fs.existsSync(PLAN)) {
  console.log('plan.json manquant — lance d\'abord : node build-plan.js');
  process.exit(1);
}
const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { skipped: [] };

function saveState() { fs.writeFileSync(STATE, JSON.stringify(state, null, 1)); }

// "fait" = le JSON de données porte déjà le champ image (source de vérité)
function isDone(job) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, job.file), 'utf8'));
  const lesson = data.lessons.find(l => l.id === job.lessonId);
  if (!lesson) return true;
  if (job.kind === 'question') {
    const q = lesson.questions.find(q => q.id === job.id);
    return !q || !!q.image;
  }
  const card = lesson.theory?.[job.partieIdx]?.cards?.[job.cardIdx];
  return !card || !!card.image;
}

function currentJob() {
  return plan.find(j => !state.skipped.includes(j.id) && !isDone(j));
}

function copyToClipboard(text) {
  const tmp = path.join(os.tmpdir(), 'atelier-prompt.txt');
  fs.writeFileSync(tmp, text, 'utf8');
  try {
    execFileSync('powershell', ['-NoProfile', '-Command',
      `Get-Content -Raw -Encoding UTF8 '${tmp}' | Set-Clipboard`], { stdio: 'ignore' });
    return true;
  } catch { return false; }
}

function showCurrent() {
  const job = currentJob();
  if (!job) { console.log('🎉 Plan terminé (ou tout le reste est skippé). Relance build-plan.js pour vérifier.'); return; }
  const pos = plan.indexOf(job) + 1;
  console.log('────────────────────────────────────────────');
  console.log(`[${pos}/${plan.length}]  ${job.lic} · thème ${job.theme} · ${job.kind === 'question' ? 'question' : 'carte'} ${job.id}`);
  console.log(`« ${job.label.slice(0, 110)} »`);
  console.log('────────────────────────────────────────────');
  console.log(job.prompt);
  console.log('────────────────────────────────────────────');
  const ok = copyToClipboard(job.prompt);
  console.log(ok ? '📋 Prompt copié — colle-le dans ChatGPT, télécharge l\'image, puis :  node atelier.js take'
                 : '⚠ Copie presse-papiers impossible — copie le prompt ci-dessus à la main.');
}

function newestDownload() {
  const dl = path.join(os.homedir(), 'Downloads');
  const exts = ['.png', '.jpg', '.jpeg', '.webp'];
  const files = fs.readdirSync(dl)
    .filter(f => exts.includes(path.extname(f).toLowerCase()))
    .map(f => ({ f: path.join(dl, f), t: fs.statSync(path.join(dl, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (!files.length) return null;
  // garde-fou : le fichier doit être récent (< 30 min) pour éviter de prendre autre chose
  if (Date.now() - files[0].t > 30 * 60 * 1000) return null;
  return files[0].f;
}

async function take(explicitFile, noAdvanceDisplay) {
  const job = currentJob();
  if (!job) { console.log('Rien à faire — plan terminé.'); return; }
  const src = explicitFile || newestDownload();
  if (!src || !fs.existsSync(src)) {
    console.log('❌ Aucune image récente (<30 min) trouvée dans Téléchargements.');
    console.log('   Télécharge l\'image depuis ChatGPT puis réessaie.');
    return;
  }
  const sharp = require('sharp');
  const outAbs = path.join(ROOT, 'public', job.out.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  await sharp(src).resize({ width: 1024, withoutEnlargement: true }).webp({ quality: 78 }).toFile(outAbs);
  const kb = Math.round(fs.statSync(outAbs).size / 1024);

  // Mise à jour du JSON de données
  const dataPath = path.join(ROOT, job.file);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const lesson = data.lessons.find(l => l.id === job.lessonId);
  if (job.kind === 'question') {
    const q = lesson.questions.find(q => q.id === job.id);
    q.image = job.out;
  } else {
    lesson.theory[job.partieIdx].cards[job.cardIdx].image = job.out;
  }
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');

  console.log(`✅ ${job.id}  ←  ${path.basename(src)}  (${kb} Ko WebP)  →  ${job.out}`);
  console.log('');
  if (!noAdvanceDisplay) showCurrent(); // enchaîne directement sur la suivante
}

// Mode interactif : une seule fenêtre, Entrée = prendre l'image téléchargée.
async function loop() {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = q => new Promise(res => rl.question(q, res));
  console.log('🎨 ATELIER IMAGES — garde ChatGPT ouvert à côté.');
  console.log('   À chaque image : Ctrl+V dans ChatGPT → Télécharger → reviens ici → Entrée.');
  console.log('   Tape s + Entrée pour passer une question, q + Entrée pour quitter.\n');
  for (;;) {
    const job = currentJob();
    if (!job) { console.log('🎉 Tout est fait !'); break; }
    showCurrent();
    const rep = (await ask('\n⏎ Entrée = je viens de télécharger l\'image | s = passer | q = quitter > ')).trim().toLowerCase();
    if (rep === 'q') break;
    if (rep === 's') { state.skipped.push(job.id); saveState(); console.log(`⏭ ${job.id} passée.\n`); continue; }
    try { await take(undefined, true); } catch (e) { console.log('❌ ' + e.message); }
  }
  rl.close();
}

const cmd = process.argv[2] || 'next';
if (cmd === 'loop') {
  loop();
} else if (cmd === 'take') {
  take(process.argv[3]).catch(e => { console.error('❌', e.message); process.exit(1); });
} else if (cmd === 'skip') {
  const job = currentJob();
  if (job) { state.skipped.push(job.id); saveState(); console.log(`⏭ ${job.id} skippée.`); }
  showCurrent();
} else if (cmd === 'status') {
  let done = 0, todo = 0, skip = 0;
  const perTheme = {};
  for (const j of plan) {
    const key = `${j.lic}-${j.theme}`;
    perTheme[key] = perTheme[key] || { done: 0, todo: 0 };
    if (isDone(j)) { done++; perTheme[key].done++; }
    else if (state.skipped.includes(j.id)) { skip++; }
    else { todo++; perTheme[key].todo++; }
  }
  console.log(`✅ faites : ${done}   ⏭ skippées : ${skip}   ⬜ restantes : ${todo}   (total plan : ${plan.length})`);
  for (const [k, v] of Object.entries(perTheme)) if (v.done > 0 || v.todo > 0) console.log(`  ${k}: ${v.done} faites / ${v.todo} restantes`);
} else {
  showCurrent();
}
