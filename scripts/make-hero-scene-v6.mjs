import sharp from "sharp";

const SRC = process.argv[2] || "public/images/hero-speaker-v6-src.png";
const OUT = "public/images/hero-speaker-v6.webp";

const SCALE = 3;
const meta = await sharp(SRC).metadata();
const W = Math.round((meta.width || 1280) * SCALE);
const H = Math.round((meta.height || 720) * SCALE);

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

const { data, info } = await sharp(SRC)
  .resize(W, H, { fit: "fill", kernel: sharp.kernel.lanczos3 })
  .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.15 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const ch = info.channels;

/**
 * Full-bleed plate: stays opaque so no rim can show, and the empty left side
 * is pushed toward the site purple so headline copy keeps its contrast.
 */
const THEME = { r: 103, g: 61, b: 230 };
const THEME_DEEP = { r: 76, g: 29, b: 149 };

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch;
    const nx = x / (w - 1);
    const ny = y / (h - 1);

    const emptyLeft = 1 - smoothstep(0.18, 0.42, nx);
    if (emptyLeft > 0.01) {
      const depth = smoothstep(0.45, 1, ny);
      const target = {
        r: THEME.r + (THEME_DEEP.r - THEME.r) * depth,
        g: THEME.g + (THEME_DEEP.g - THEME.g) * depth,
        b: THEME.b + (THEME_DEEP.b - THEME.b) * depth,
      };
      const t = emptyLeft * 0.4;
      data[i] = Math.round(data[i] * (1 - t) + target.r * t);
      data[i + 1] = Math.round(data[i + 1] * (1 - t) + target.g * t);
      data[i + 2] = Math.round(data[i + 2] * (1 - t) + target.b * t);
    }

    data[i + 3] = 255;
  }
}

const tinted = await sharp(data, { raw: { width: w, height: h, channels: ch } })
  .png()
  .toBuffer();

/**
 * Extra headroom above the cap: stretch the topmost row upward. Its colour
 * equals the plate's first row, so the join is invisible.
 */
const padTop = Math.round(h * 0.04);
const headroom = await sharp(tinted)
  .extract({ left: 0, top: 0, width: w, height: 1 })
  .resize(w, padTop, { fit: "fill" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: w,
    height: h + padTop,
    channels: 4,
    background: { r: 76, g: 29, b: 149, alpha: 1 },
  },
})
  .composite([
    { input: headroom, left: 0, top: 0 },
    { input: tinted, left: 0, top: padTop },
  ])
  .webp({ quality: 94, effort: 6 })
  .toFile(OUT);

console.log("wrote", OUT, `${w}x${h + padTop}`);
