// Atelier images — boucle de production avec ChatGPT Plus (zéro API, zéro coût).
//
//   Double-clic sur ATELIER.bat (= node atelier.js loop) — mode interactif :
//     Entrée = je viens de télécharger l'image  →  installée + prompt suivant
//     p      = donne-moi le prompt SUIVANT sans attendre (mode lot : 2-3
//              discussions ChatGPT en parallèle, on récolte tout à la fin)
//     s      = passer la question courante
//     q      = quitter (l'avancement est conservé)
//
//   Autres commandes : node atelier.js | take [fichier] | skip | status
//
// Mode lot : tape p pour empiler 2-3 prompts (chacun est copié au moment du p),
// colle-les dans des discussions ChatGPT séparées, télécharge les images
// DANS L'ORDRE DES PROMPTS, puis Entrée : l'atelier associe la plus ancienne
// image au premier prompt, etc., et te montre l'association avant d'écrire.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const PLAN = path.join(__dirname, 'plan.json');
const STATE = path.join(__dirname, 'state.json');
const DL_DIR = process.env.ATELIER_DL || path.join(os.homedir(), 'Downloads');
const RECENT_MS = 30 * 60 * 1000; // une image doit dater de moins de 30 min

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

function nextJob(excludeIds = []) {
  return plan.find(j => !excludeIds.includes(j.id) && !state.skipped.includes(j.id) && !isDone(j));
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

function showJob(job, tag) {
  const pos = plan.indexOf(job) + 1;
  console.log('────────────────────────────────────────────');
  console.log(`${tag ? tag + '  ' : ''}[${pos}/${plan.length}]  ${job.lic} · thème ${job.theme} · ${job.kind === 'question' ? 'question' : 'carte'} ${job.id}`);
  console.log(`« ${job.label.slice(0, 110)} »`);
  console.log('────────────────────────────────────────────');
  console.log(job.prompt);
  console.log('────────────────────────────────────────────');
  const ok = copyToClipboard(job.prompt);
  console.log(ok ? '📋 Prompt copié dans le presse-papiers.'
                 : '⚠ Copie presse-papiers impossible — copie le prompt ci-dessus à la main.');
}

// Images récentes de Téléchargements, de la plus RÉCENTE à la plus ancienne
function recentDownloads() {
  const exts = ['.png', '.jpg', '.jpeg', '.webp'];
  if (!fs.existsSync(DL_DIR)) return [];
  return fs.readdirSync(DL_DIR)
    .filter(f => exts.includes(path.extname(f).toLowerCase()))
    .map(f => ({ f: path.join(DL_DIR, f), t: fs.statSync(path.join(DL_DIR, f)).mtimeMs }))
    .filter(x => Date.now() - x.t <= RECENT_MS)
    .sort((a, b) => b.t - a.t);
}

// Empreinte du contenu SOURCE (avant compression) — détecte les téléchargements
// en double même si sharp les recompresse différemment ensuite.
function fileHash(p) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
}

async function takeFileForJob(job, src) {
  const sharp = require('sharp');

  // Garde-fou anti-doublon : la même image source déjà utilisée pour une AUTRE question ?
  const hash = fileHash(src);
  state.hashes = state.hashes || {};
  const prevId = state.hashes[hash];
  if (prevId && prevId !== job.id) {
    console.log(`\n🚨 STOP — cette image est IDENTIQUE à celle déjà utilisée pour ${prevId} !`);
    console.log(`   Tu as sûrement retéléchargé la même image, ou pris le mauvais fichier.`);
    console.log(`   Vérifie dans Téléchargements et relance la récolte avec la bonne image.\n`);
    throw new Error('doublon détecté — rien n\'a été écrit');
  }
  state.hashes[hash] = job.id;
  saveState();

  const outAbs = path.join(ROOT, 'public', job.out.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  await sharp(src).resize({ width: 1024, withoutEnlargement: true }).webp({ quality: 78 }).toFile(outAbs);
  const kb = Math.round(fs.statSync(outAbs).size / 1024);

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
}

async function take(explicitFile, noAdvanceDisplay) {
  const job = nextJob();
  if (!job) { console.log('Rien à faire — plan terminé.'); return; }
  const src = explicitFile || (recentDownloads()[0] || {}).f;
  if (!src || !fs.existsSync(src)) {
    console.log('❌ Aucune image récente (<30 min) trouvée dans Téléchargements.');
    console.log('   Télécharge l\'image depuis ChatGPT puis réessaie.');
    return;
  }
  await takeFileForJob(job, src);
  console.log('');
  if (!noAdvanceDisplay) {
    const nj = nextJob();
    if (nj) showJob(nj); else console.log('🎉 Plan terminé !');
  }
}

// Saisie SYNCHRONE au clavier — fiable dans la console Windows (readline
// asynchrone laissait parfois node se terminer avant la première question).
let inputBuf = '';
function askSync(label) {
  process.stdout.write(label);
  for (;;) {
    const nl = inputBuf.indexOf('\n');
    if (nl >= 0) {
      const line = inputBuf.slice(0, nl);
      inputBuf = inputBuf.slice(nl + 1);
      return line.replace(/\r$/, '').trim().toLowerCase();
    }
    const buf = Buffer.alloc(4096);
    let bytes = 0;
    try { bytes = fs.readSync(0, buf, 0, 4096, null); } catch { return 'q'; }
    if (bytes === 0) return 'q'; // fin d'entrée = quitter proprement
    inputBuf += buf.toString('utf8', 0, bytes);
  }
}

// Mode interactif : une seule fenêtre. Entrée = récolter, p = prompt suivant (lot).
async function loop() {
  const ask = q => Promise.resolve(askSync(q));
  console.log('🎨 ATELIER IMAGES — garde ChatGPT ouvert à côté.');
  console.log('   Simple  : Ctrl+V dans ChatGPT → Télécharger → Entrée ici.');
  console.log('   Par lot : p pour chaque prompt supplémentaire (2-3 discussions en');
  console.log('             parallèle), télécharge DANS L\'ORDRE, puis Entrée.');
  console.log('   s = passer la question · q = quitter (avancement conservé)\n');

  let pending = []; // prompts distribués, images pas encore récoltées

  for (;;) {
    if (pending.length === 0) {
      const job = nextJob();
      if (!job) { console.log('🎉 Tout est fait !'); break; }
      pending = [job];
      showJob(job, '🅰');
    }
    const label = pending.length > 1
      ? `\n⏎ Entrée = les ${pending.length} images sont téléchargées | p = prompt suivant | q = quitter > `
      : '\n⏎ Entrée = image téléchargée | p = prompt suivant (lot) | s = passer | q = quitter > ';
    const rep = (await ask(label)).trim().toLowerCase();

    if (rep === 'q') { if (pending.length > 1) console.log('(lot abandonné — rien n\'a été écrit)'); break; }

    if (rep === 'p') {
      const j = nextJob(pending.map(p => p.id));
      if (!j) { console.log('Plus rien à empiler — termine ce lot.'); continue; }
      pending.push(j);
      showJob(j, ['🅰', '🅱', '🅲', '🅳', '🅴'][pending.length - 1] || '•');
      continue;
    }

    if (rep === 's') {
      if (pending.length > 1) { console.log('⚠ Termine d\'abord le lot en cours (Entrée), puis tu pourras passer.'); continue; }
      state.skipped.push(pending[0].id); saveState();
      console.log(`⏭ ${pending[0].id} passée.\n`);
      pending = [];
      continue;
    }

    // Entrée : récolte
    const dls = recentDownloads();
    if (dls.length < pending.length) {
      console.log(`❌ Je ne trouve que ${dls.length} image(s) récente(s) dans Téléchargements — il en faut ${pending.length}. Télécharge-les puis refais Entrée.`);
      continue;
    }
    // les N plus récentes, remises dans l'ordre de téléchargement (ancienne → récente)
    const picked = dls.slice(0, pending.length).sort((a, b) => a.t - b.t);
    if (pending.length > 1) {
      console.log('\nAssociation proposée (ordre de téléchargement = ordre des prompts) :');
      pending.forEach((j, i) => console.log(`  ${['🅰', '🅱', '🅲', '🅳', '🅴'][i] || '•'} ${j.id}  ←  ${path.basename(picked[i].f)}`));
      const conf = (await ask('C\'est bon ? (Entrée/o = oui, n = annuler) > ')).trim().toLowerCase();
      if (conf === 'n') { console.log('Annulé — rien n\'a été écrit. Re-télécharge dans le bon ordre puis Entrée.'); continue; }
    }
    let failedJob = null;
    for (let i = 0; i < pending.length; i++) {
      try {
        await takeFileForJob(pending[i], picked[i].f);
      } catch (e) {
        console.log('❌ ' + e.message);
        failedJob = pending[i];
        break;
      }
    }
    console.log('');
    if (failedJob) {
      // On ne rejoue PAS le lot entier (l'ordre chrono ne s'y prêterait plus) :
      // on isole juste la question en échec, en mode simple, pour une reprise propre.
      console.log(`👉 ${failedJob.id} : retourne dans SON onglet ChatGPT, télécharge une image FRAÎCHE pour CETTE question, puis Entrée.\n`);
      pending = [failedJob];
      showJob(failedJob, '🅰');
    } else {
      pending = [];
    }
  }
}

const cmd = process.argv[2] || 'next';
if (cmd === 'loop') {
  loop();
} else if (cmd === 'take') {
  take(process.argv[3]).catch(e => { console.error('❌', e.message); process.exit(1); });
} else if (cmd === 'skip') {
  const job = nextJob();
  if (job) { state.skipped.push(job.id); saveState(); console.log(`⏭ ${job.id} skippée.`); }
  const nj = nextJob();
  if (nj) showJob(nj);
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
  const job = nextJob();
  if (job) showJob(job); else console.log('🎉 Plan terminé !');
}
