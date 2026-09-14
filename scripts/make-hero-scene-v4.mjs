import sharp from "sharp";

const SRC = process.argv[2] || "public/images/hero-speaker-scene-v4-src.jpg";
const OUT = "public/images/hero-speaker-scene-v4.png";

const W = 1920;
const H = 1080;
const TOP = { r: 109, g: 40, b: 217 };
const MID = { r: 103, g: 61, b: 230 };
const BOT = { r: 76, g: 29, b: 149 };

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function mix(r, g, b, t, c) {
  return [
    Math.round(r * (1 - t) + c.r * t),
    Math.round(g * (1 - t) + c.g * t),
    Math.round(b * (1 - t) + c.b * t),
  ];
}

const { data, info } = await sharp(SRC)
  .rotate()
  .resize(W, H, {
    fit: "cover",
    position: "centre",
    kernel: sharp.kernel.lanczos3,
  })
  .sharpen({ sigma: 0.8, m1: 0.8, m2: 0.2 })
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

    const speaker = nx > 0.36 && nx < 0.93 && ny > 0.02 && ny < 0.9;
    const leftMix = 1 - smoothstep(0.02, 0.3, nx);
    const topMix = 1 - smoothstep(0.0, 0.1, ny);
    const botMix = smoothstep(0.86, 1, ny);
    const rightMix = smoothstep(0.94, 1, nx);
    const cornerTL = (1 - smoothstep(0, 0.22, nx)) * (1 - smoothstep(0, 0.16, ny));
    const cornerBR = smoothstep(0.88, 1, nx) * smoothstep(0.82, 1, ny);

    let tint = Math.max(leftMix * 0.92, topMix * 0.55, botMix * 0.78, rightMix * 0.42);
    tint = Math.max(tint, cornerTL * 0.85, cornerBR * 0.5);
    if (speaker) tint *= 0.08;

    const bg = ny < 0.42 ? TOP : ny > 0.78 ? BOT : MID;
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    if (tint > 0.01) [r, g, b] = mix(r, g, b, tint, bg);

    let alpha = 255;
    const leftA = smoothstep(0.0, 0.16, nx);
    const topA = smoothstep(0.0, 0.07, ny);
    const botA = 1 - smoothstep(0.9, 1, ny);
    const rightA = 1 - smoothstep(0.97, 1, nx);
    alpha = Math.round(255 * Math.min(leftA, topA, botA, rightA));
    if (speaker) alpha = Math.max(alpha, 250);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = alpha;
  }
}

await sharp(data, { raw: { width: w, height: h, channels: ch } })
  .png({ compressionLevel: 8 })
  .toFile(OUT);

await sharp(OUT).toFile("public/images/hero-speaker-scene-v3.png");
await sharp(OUT).toFile("public/images/hero-speaker-scene.png");

console.log("wrote", OUT, w, "x", h);
