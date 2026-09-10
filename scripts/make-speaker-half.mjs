import sharp from "sharp";

const SRC = "public/images/hero-speaker-clear.png";
const OUT = "public/images/hero-speaker-half.png";

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const out = Buffer.from(data);

// 1) Knock near-black bg to transparent (protect dark accessories via chroma)
for (let i = 0; i < out.length; i += 4) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  const a = out[i + 3];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  if (a < 8) {
    out[i + 3] = 0;
    continue;
  }
  // Flat black / near-black background
  if (max < 36 && chroma < 14) {
    out[i + 3] = 0;
    continue;
  }
  if (max < 52 && chroma < 10) {
    out[i + 3] = Math.round(a * Math.max(0, (max - 28) / 24));
  }
}

// 2) Soft edge feather around silhouette
const feathered = Buffer.from(out);
for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4;
    if (out[i + 3] === 0) continue;
    let empty = 0;
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, 1],
    ]) {
      const ni = ((y + dy) * w + (x + dx)) * 4;
      if (out[ni + 3] < 20) empty++;
    }
    if (empty >= 2) {
      feathered[i + 3] = Math.round(out[i + 3] * (1 - empty * 0.12));
    }
  }
}

// 3) Soft bottom fade only (natural blend into white shelf — not a box)
for (let y = 0; y < h; y++) {
  const t = y / (h - 1);
  let bottom = 1;
  if (t > 0.78) bottom = 1 - Math.pow((t - 0.78) / 0.22, 1.15);
  if (t > 0.93) bottom *= Math.max(0, 1 - (t - 0.93) / 0.07);
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    feathered[i + 3] = Math.round(feathered[i + 3] * Math.max(0, Math.min(1, bottom)));
  }
}

await sharp(feathered, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

let opaque = 0;
let black = 0;
const check = await sharp(OUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < check.data.length; i += 4) {
  if (check.data[i + 3] < 12) continue;
  opaque++;
  if (check.data[i] < 20 && check.data[i + 1] < 20 && check.data[i + 2] < 20) black++;
}
console.log({ out: OUT, w, h, opaque, leftoverNearBlack: black });
