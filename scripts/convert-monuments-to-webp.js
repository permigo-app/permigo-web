/**
 * Converts all PNG monuments to WebP (quality 85).
 * Originals are kept — WebP files are added alongside them.
 * Run: node scripts/convert-monuments-to-webp.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MONUMENTS_DIR = path.join(__dirname, '..', 'public', 'monuments');
const QUALITY = 85;

(async () => {
  const files = fs.readdirSync(MONUMENTS_DIR).filter(f => f.endsWith('.png'));

  if (files.length === 0) {
    console.log('No PNG files found in', MONUMENTS_DIR);
    process.exit(0);
  }

  let totalBefore = 0;
  let totalAfter = 0;

  console.log('\n📐 Conversion PNG → WebP (qualité', QUALITY, ')\n');
  console.log(
    'Fichier'.padEnd(28),
    'Avant'.padStart(10),
    'Après'.padStart(10),
    'Gain %'.padStart(8)
  );
  console.log('─'.repeat(60));

  for (const file of files) {
    const pngPath = path.join(MONUMENTS_DIR, file);
    const webpFile = file.replace('.png', '.webp');
    const webpPath = path.join(MONUMENTS_DIR, webpFile);

    const beforeBytes = fs.statSync(pngPath).size;
    totalBefore += beforeBytes;

    await sharp(pngPath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);

    const afterBytes = fs.statSync(webpPath).size;
    totalAfter += afterBytes;

    const gain = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
    const beforeKB = (beforeBytes / 1024).toFixed(0) + ' KB';
    const afterKB = (afterBytes / 1024).toFixed(0) + ' KB';

    console.log(
      file.padEnd(28),
      beforeKB.padStart(10),
      afterKB.padStart(10),
      (gain + '%').padStart(8)
    );
  }

  console.log('─'.repeat(60));
  const totalGain = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);
  console.log(
    'TOTAL'.padEnd(28),
    ((totalBefore / 1024 / 1024).toFixed(1) + ' MB').padStart(10),
    ((totalAfter / 1024 / 1024).toFixed(1) + ' MB').padStart(10),
    (totalGain + '%').padStart(8)
  );
  console.log('\n✅ Conversion terminée. PNG originaux conservés.\n');
})();
