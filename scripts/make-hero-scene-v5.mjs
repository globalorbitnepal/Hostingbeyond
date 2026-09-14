import sharp from "sharp";

const SRC = process.argv[2] || "public/images/hero-speaker-scene-v4-src.jpg";
const OUT = "public/images/hero-speaker-scene-v5.png";

const meta = await sharp(SRC).metadata();
const srcW = meta.width || 1024;
const srcH = meta.height || 560;
const scale = 2.5;
const W = Math.round(srcW * scale);
const H = Math.round(srcH * scale);

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

const { data, info } = await sharp(SRC)
  .rotate()
  .resize(W, H, {
    fit: "fill",
    kernel: sharp.kernel.lanczos3,
  })
  .sharpen({ sigma: 0.55, m1: 0.45, m2: 0.12 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const ch = info.channels;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch;
    const nx = x / (w - 1);
    const ny = y / (h - 1);
    const speaker = nx > 0.34 && nx < 0.96 && ny > 0.04 && ny < 0.9;

    const leftA = smoothstep(0.0, 0.18, nx);
    const topA = smoothstep(0.0, 0.06, ny);
    const botA = 1 - smoothstep(0.9, 1, ny);
    const rightA = 1 - smoothstep(0.975, 1, nx);
    let alpha = Math.min(leftA, topA, botA, rightA);
    if (speaker) alpha = Math.max(alpha, 0.97);
    data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, alpha)));
  }
}

await sharp(data, { raw: { width: w, height: h, channels: ch } })
  .png({ compressionLevel: 6, adaptiveFiltering: true })
  .toFile(OUT);

await sharp(OUT).toFile("public/images/hero-speaker-scene-v4.png");

console.log("wrote", OUT, `${w}x${h}`, "from", `${srcW}x${srcH}`);
