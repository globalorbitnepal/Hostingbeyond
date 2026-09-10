import sharp from "sharp";
import { writeFileSync } from "fs";

const SRC = "public/images/hero-speaker-clear.png";
const OUT = "public/images/hero-speaker-cutout.png";

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const out = Buffer.from(data);

// Knock near-black to transparent; soft edge on leftover dark fringe
for (let i = 0; i < out.length; i += 4) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  const a = out[i + 3];
  const max = Math.max(r, g, b);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Pure / near-black background → fully transparent
  if (max < 28 && lum < 22) {
    out[i + 3] = 0;
    continue;
  }

  // Soft fringe: dark-but-not-black edges near transparency
  if (a > 0 && max < 55 && lum < 45) {
    const t = Math.max(0, Math.min(1, (max - 18) / 40));
    out[i + 3] = Math.round(a * t * t);
  }
}

// 1px alpha feather for smoother blend
const feathered = Buffer.from(out);
for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4;
    if (out[i + 3] === 0) continue;
    let minN = 255;
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const ni = ((y + dy) * w + (x + dx)) * 4;
      minN = Math.min(minN, out[ni + 3]);
    }
    if (minN < 40) {
      feathered[i + 3] = Math.round(out[i + 3] * 0.55);
    }
  }
}

await sharp(feathered, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const check = await sharp(OUT)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let black = 0;
let opaque = 0;
for (let i = 0; i < check.data.length; i += 4) {
  const a = check.data[i + 3];
  if (a < 10) continue;
  opaque++;
  if (check.data[i] < 18 && check.data[i + 1] < 18 && check.data[i + 2] < 18)
    black++;
}
console.log({ out: OUT, w, h, opaque, leftoverBlack: black });
writeFileSync(
  "tmp-assets/cutout-stats.json",
  JSON.stringify({ opaque, leftoverBlack: black }, null, 2),
);
