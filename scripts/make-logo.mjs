/**
 * Builds the logo files from src/assets/brand/logo-source.jpeg (black logo on a light background).
 * Run again after replacing the source:  npm run logo
 *
 * Creates (transparent PNG):
 *   src/assets/brand/logo-full-dark.png   S + STRADA, dark  (header, light backgrounds)
 *   src/assets/brand/logo-full-light.png  S + STRADA, cream (footer, dark backgrounds)
 *   src/assets/brand/logo-mark-dark.png   S only, dark
 *   src/assets/brand/logo-mark-light.png  S only, cream
 *   src/assets/brand/logo-word-dark.png   STRADA only, dark / logo-word-light.png cream
 *   public/favicon.png, public/apple-touch-icon.png, public/og-image.jpg
 */
import sharp from 'sharp';

const SRC = 'src/assets/brand/logo-source.jpeg';
const OUT = 'src/assets/brand';
const DARK = '#2a211b';
const LIGHT = '#faf7f2';

const { width, height } = await sharp(SRC).metadata();

/** Dark pixels → opaque, light background → transparent (smooth edges) */
async function alphaMask(region) {
  const { data, info } = await sharp(SRC)
    .extract(region)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i++) {
    const a = ((215 - data[i]) / 175) * 255; // 215+ = background, 40- = full ink
    data[i] = Math.max(0, Math.min(255, Math.round(a)));
  }
  return { data, info };
}

async function colored(region, color, file) {
  const { data, info } = await alphaMask(region);
  const img = await sharp({ create: { width: info.width, height: info.height, channels: 3, background: color } })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
  await sharp(img).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

// Regions measured on the source image (in % so a resized source still works)
const box = (x1, y1, x2, y2) => ({
  left: Math.round(width * x1),
  top: Math.round(height * y1),
  width: Math.round(width * (x2 - x1)),
  height: Math.round(height * (y2 - y1)),
});
const FULL = box(0.12, 0.2, 0.88, 0.86); // S + STRADA
const MARK = box(0.29, 0.2, 0.7, 0.64); // S only
const WORD = box(0.12, 0.68, 0.88, 0.85); // STRADA only

await colored(FULL, DARK, `${OUT}/logo-full-dark.png`);
await colored(FULL, LIGHT, `${OUT}/logo-full-light.png`);
await colored(MARK, DARK, `${OUT}/logo-mark-dark.png`);
await colored(MARK, LIGHT, `${OUT}/logo-mark-light.png`);
await colored(WORD, DARK, `${OUT}/logo-word-dark.png`);
await colored(WORD, LIGHT, `${OUT}/logo-word-light.png`);

// Favicons: cream S on the brand brown, rounded square
async function icon(size, file, radius) {
  const pad = Math.round(size * 0.2);
  const mark = await sharp(`${OUT}/logo-mark-light.png`)
    .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#3b2a1e"/></svg>`,
  );
  await sharp(bg).composite([{ input: mark, gravity: 'center' }]).png().toFile(file);
}
await icon(64, 'public/favicon.png', 14);
await icon(180, 'public/apple-touch-icon.png', 0); // iOS rounds the corners itself

// Social share image (1200x630): logo on the left, product drawing on the right
const logo = await sharp(`${OUT}/logo-full-dark.png`).resize({ height: 340 }).toBuffer();
const sandal = await sharp('src/assets/products/brown-1.webp').resize(560, 560).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f3ece2' } })
  .composite([
    { input: logo, top: 145, left: 90 },
    { input: sandal, top: 35, left: 600 },
  ])
  .jpeg({ quality: 85 })
  .toFile('public/og-image.jpg');

console.log('Logo files generated ✔');
