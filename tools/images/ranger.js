// RANGER — installe des images sur des questions PRÉCISES, sans passer par l'ordre du lot.
//
//   node tools/images/ranger.js A6_Q28="C:\chemin\image1.png" A6_Q32="C:\chemin\image2.png" …
//   node tools/images/ranger.js --verifier A6_Q28=…        (simulation, n'écrit rien)
//
// À quoi ça sert : le mode lot de l'atelier associe la Nᵉ image téléchargée au Nᵉ prompt.
// Si une image manque ou si l'une a été téléchargée deux fois, tout le lot se décale et
// les images finissent sur les mauvaises questions. Ici on nomme explicitement la paire,
// donc l'association est celle qu'on a vérifiée à l'œil, pas celle de l'horodatage.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PLAN = path.join(__dirname, 'plan.json');
const STATE = path.join(__dirname, 'state.json');

const args = process.argv.slice(2);
const DRY = args.includes('--verifier');
const paires = args.filter(a => a.includes('=')).map(a => {
  const i = a.indexOf('=');
  return { id: a.slice(0, i).trim(), src: a.slice(i + 1).trim().replace(/^["']|["']$/g, '') };
});

if (paires.length === 0) {
  console.log('Usage : node tools/images/ranger.js <ID>="<chemin image>" [<ID>="<chemin>" …]');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
state.hashes = state.hashes || {};
state.reprises = state.reprises || [];

const md5 = p => require('crypto').createHash('md5').update(fs.readFileSync(p)).digest('hex');

(async () => {
  const sharp = DRY ? null : require('sharp');
  let ok = 0;
  const vus = new Map();

  for (const { id, src } of paires) {
    const job = plan.find(j => j.id === id);
    if (!job) { console.log(`✗ ${id} : absent du plan`); continue; }
    if (!fs.existsSync(src)) { console.log(`✗ ${id} : fichier introuvable — ${src}`); continue; }

    // deux entrées de la même commande qui pointent le même fichier = erreur de saisie
    const h = md5(src);
    if (vus.has(h)) { console.log(`✗ ${id} : même image que ${vus.get(h)} dans cette commande`); continue; }
    const proprio = state.hashes[h];
    if (proprio && proprio !== id) { console.log(`✗ ${id} : cette image sert déjà à ${proprio}`); continue; }
    vus.set(h, id);

    const dataPath = path.join(ROOT, job.file);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8').replace(/^\uFEFF/, ''));
    const lesson = data.lessons.find(l => l.id === job.lessonId);
    const cible = job.kind === 'question'
      ? lesson.questions.find(q => q.id === job.id)
      : lesson.theory[job.partieIdx].cards[job.cardIdx];
    if (!cible) { console.log(`✗ ${id} : introuvable dans les données`); continue; }

    if (DRY) { console.log(`· ${id.padEnd(10)} ← ${path.basename(src)}   →  ${job.out}`); ok++; continue; }

    const outAbs = path.join(ROOT, 'public', job.out.replace(/^\//, ''));
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    await sharp(src).resize({ width: 1024, withoutEnlargement: true }).webp({ quality: 78 }).toFile(outAbs);
    const ko = Math.round(fs.statSync(outAbs).size / 1024);

    cible.image = job.out;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');

    state.hashes[h] = id;
    if (!state.reprises.includes(id)) state.reprises.push(id);
    console.log(`✅ ${id.padEnd(10)} ← ${path.basename(src)}   (${ko} Ko)  →  ${job.out}`);
    ok++;
  }

  if (!DRY) fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
  console.log(`\n${ok}/${paires.length} ${DRY ? 'vérifiées' : 'rangées'}\n`);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
