import sharp from "sharp";

const src = "tmp-assets/hero-mockup-final.jpg";
const meta = await sharp(src).metadata();
const W = meta.width || 1024;
const H = meta.height || 576;

const left = Math.floor(W * 0.44);
const top = Math.floor(H * 0.1);
const width = W - left;
const height = Math.floor(H * 0.76);

const plateW = 1000;
const plateH = 800;

// Base plate from mockup right side
const base = await sharp(src)
  .extract({ left, top, width, height })
  .resize(plateW, plateH, { fit: "cover" })
  .toBuffer();

// Soft fill sampled from upper glass/office area (no person)
const fillPatch = await sharp(src)
  .extract({
    left: Math.floor(W * 0.72),
    top: Math.floor(H * 0.12),
    width: Math.floor(W * 0.18),
    height: Math.floor(H * 0.28),
  })
  .resize(plateW, plateH, { fit: "cover" })
  .blur(28)
  .modulate({ brightness: 1.12, saturation: 0.7 })
  .toBuffer();

const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${plateW}" height="${plateH}">
  <defs>
    <radialGradient id="m" cx="46%" cy="40%" r="46%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="55%" stop-color="#fff" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#m)"/>
</svg>`);

const maskedFill = await sharp(fillPatch)
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

const wash = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${plateW}" height="${plateH}">
  <defs>
    <radialGradient id="g" cx="46%" cy="38%" r="48%">
      <stop offset="0%" stop-color="#f5f9ff" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="#e0efff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#93c5fd" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="70%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f4f7fc" stop-opacity="0.65"/>
      <stop offset="22%" stop-color="#f4f7fc" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#b)"/>
  <rect width="100%" height="100%" fill="url(#l)"/>
</svg>`);

await sharp(base)
  .modulate({ brightness: 1.06, saturation: 0.95 })
  .composite([
    { input: maskedFill, blend: "over" },
    { input: wash, blend: "over" },
  ])
  .jpeg({ quality: 92 })
  .toFile("public/images/hero-atmosphere.jpg");

console.log("atmosphere", await sharp("public/images/hero-atmosphere.jpg").metadata());
