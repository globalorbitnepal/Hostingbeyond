import fs from "fs";
import sharp from "sharp";

/**
 * Dissolve L/T/R rim into transparency + sky tint so page bg shows through.
 * No zoom/crop. Keeps speaker/core sharp.
 */
const BAK = "public/images/hero-speaker-scene-v3.bak.png";
const SRC = fs.existsSync(BAK)
  ? BAK
  : "public/images/hero-speaker-scene-v3.png";
const OUT = "public/images/hero-speaker-scene-v3.png";
const SKY = { r: 181, g: 211, b: 242 }; // #b5d3f2

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const ch = info.channels;

const leftBand = Math.max(24, Math.round(w * 0.048));
const topBand = Math.max(40, Math.round(h * 0.07));
const rightBand = Math.max(26, Math.round(w * 0.045));

/** Edge strength 1 at rim → 0 inward */
function edgeT(dist, band) {
  if (dist >= band) return 0;
  const u = 1 - dist / band;
  return Math.pow(u, 1.15);
}

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    let t = 0;
    t = Math.max(t, edgeT(x, leftBand));
    t = Math.max(t, edgeT(y, topBand));
    t = Math.max(t, edgeT(w - 1 - x, rightBand));
    // UL corner stronger seal
    if (x < leftBand * 1.15 && y < topBand * 1.15) {
      const cx = x / (leftBand * 1.15);
      const cy = y / (topBand * 1.15);
      t = Math.max(t, Math.pow(1 - Math.min(1, Math.hypot(cx, cy)), 1.05));
    }
    if (t < 0.015) continue;

    const i = (y * w + x) * ch;
    const a = Math.min(1, t);
    // Tint toward sky
    data[i] = Math.round(data[i] * (1 - a) + SKY.r * a);
    data[i + 1] = Math.round(data[i + 1] * (1 - a) + SKY.g * a);
    data[i + 2] = Math.round(data[i + 2] * (1 - a) + SKY.b * a);
    // Alpha dissolve — page sky shows through (kills hard frame)
    if (ch >= 4) {
      const fade = Math.min(1, a * 1.05);
      data[i + 3] = Math.round(data[i + 3] * (1 - fade));
    }
  }
}

await sharp(data, { raw: { width: w, height: h, channels: ch } })
  .png()
  .toFile(OUT);
console.log("alpha dissolve rim", { w, h, leftBand, topBand, rightBand });
