/**
 * Builds the site product images from the original photos (one photo per color).
 *   Source:  src/assets/products/originals/{black,beige,brown}.png
 *   Output:  src/assets/products/{color}-1.webp  full product (4:3, centered, soft shadow)
 *            src/assets/products/{color}-2.webp  close-up: buckle
 *            src/assets/products/{color}-3.webp  close-up: front of the shoe
 * Run again after replacing a photo:  npm run images
 */
import sharp from 'sharp';

const IN = 'src/assets/products/originals';
const OUT = 'src/assets/products';
const COLORS = ['black', 'beige', 'brown'];
const SIZE = 1200;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Close-ups, in % of the photo (the 3 photos share the same framing)
const DETAILS = {
  2: { cx: 0.75, cy: 0.565, size: 0.47 }, // buckle
  3: { cx: 0.36, cy: 0.6, size: 0.56 }, // front of the shoe
};

/**
 * Makes the almost-white background pure white (#fff), with a smooth ramp so the shoe's soft
 * shadow fades out without a visible edge. On the white site cards the photo then has no "box".
 */
async function cleanBackground(file) {
  const { data, info } = await sharp(file).flatten({ background: WHITE }).raw().toBuffer({ resolveWithObject: true });
  const FROM = 228; // below: untouched (shoe + shadow core)
  const TO = 250; //   above: pure white
  for (let i = 0; i < data.length; i += 3) {
    const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (l <= FROM) continue;
    const t = Math.min(1, (l - FROM) / (TO - FROM));
    const k = t * t * (3 - 2 * t); // smoothstep
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (255 - data[i + c]) * k);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
}

for (const color of COLORS) {
  const src = await cleanBackground(`${IN}/${color}.png`);
  const { width, height } = await sharp(src).metadata();

  // 1 — full product, landscape 4:3 (fits the wide hero card on phones; letterboxed in white
  //     in square cards, which is invisible on the white cards). A soft shadow is drawn under the shoe.
  const trimmed = await sharp(src).trim({ background: '#ffffff', threshold: 2 }).toBuffer();
  const t = await sharp(trimmed).metadata();
  const W = Math.round(Math.max(t.width * 1.06, ((t.height * 1.1) * 4) / 3));
  const H = Math.round((W * 3) / 4);
  const left = Math.floor((W - t.width) / 2);
  const top = Math.floor((H - t.height) / 2);
  const shadow = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(t.height * 0.035)}"/></filter>
      <ellipse cx="${W / 2}" cy="${top + t.height * 0.93}" rx="${t.width * 0.38}" ry="${t.height * 0.055}"
        fill="#3b2a1e" fill-opacity="0.22" filter="url(#b)"/>
    </svg>`,
  );
  const canvas = await sharp(trimmed)
    .extend({ top, bottom: H - t.height - top, left, right: W - t.width - left, background: WHITE })
    .toBuffer(); // sharp resizes before extending, so the padding is done in a separate step
  await sharp(canvas)
    .composite([{ input: shadow, blend: 'multiply' }])
    .resize(SIZE, Math.round((SIZE * 3) / 4))
    .webp({ quality: 88 })
    .toFile(`${OUT}/${color}-1.webp`);

  // 2, 3 — close-ups
  for (const [n, d] of Object.entries(DETAILS)) {
    const s = Math.round(width * d.size);
    const left = Math.max(0, Math.min(width - s, Math.round(width * d.cx - s / 2)));
    const top = Math.max(0, Math.min(height - s, Math.round(height * d.cy - s / 2)));
    await sharp(src)
      .extract({ left, top, width: s, height: s })
      .resize(SIZE, SIZE)
      .webp({ quality: 88 })
      .toFile(`${OUT}/${color}-${n}.webp`);
  }
  console.log(`${color} ✔`);
}
