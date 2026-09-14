// Turns the supplied HostingBeyond logo (flat black plate) into a tight,
// transparent PNG for the light glass header, footer and login page.
//
// The plate is effectively the artwork composited over black, so bright pixels
// unpremultiply cleanly. The "Hosting" wordmark is deep navy (max channel ~45),
// which is close to the plate itself, so it is masked with a low threshold and
// kept at full alpha instead of being unpremultiplied away.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

const SRC =
  process.argv[2] ||
  "/home/sysadmin/.cursor/projects/srv-apps-hostingbeyond/assets/c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_6b7acb524f4facc74cd7bdf721355502_images_Hosting_beyond_logo-5f4b5ebc-4378-4cfd-8454-5c57dc8bc2ed.webp";
const OUT = path.resolve("public/logo/hostingbeyond-logo-v6.png");

const DARK_LO = 8; // plate compression halo sits at 1-5
const DARK_HI = 30; // deep-navy glyph body plateaus around 40
const BRIGHT = 110; // pixels this bright are treated as premultiplied colour
const NEIGHBOUR = 3; // radius used to detect antialiasing next to bright glyphs

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const max = new Uint8Array(width * height);
for (let i = 0, p = 0; i < data.length; i += channels, p += 1) {
  max[p] = Math.max(data[i], data[i + 1], data[i + 2]);
}

// Local maximum so a dark antialiasing ring around a bright glyph is not
// mistaken for the navy wordmark.
const localMax = new Uint8Array(width * height);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    let best = 0;
    const y0 = Math.max(0, y - NEIGHBOUR);
    const y1 = Math.min(height - 1, y + NEIGHBOUR);
    const x0 = Math.max(0, x - NEIGHBOUR);
    const x1 = Math.min(width - 1, x + NEIGHBOUR);
    for (let yy = y0; yy <= y1; yy += 1) {
      for (let xx = x0; xx <= x1; xx += 1) {
        const value = max[yy * width + xx];
        if (value > best) best = value;
      }
    }
    localMax[y * width + x] = best;
  }
}

const out = Buffer.alloc(width * height * 4);
for (let p = 0; p < width * height; p += 1) {
  const i = p * channels;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const m = max[p];
  const o = p * 4;

  if (m <= DARK_LO) continue; // stays fully transparent

  const nearBright = localMax[p] >= BRIGHT;
  if (m >= BRIGHT || nearBright) {
    // Premultiplied over black → unpremultiply with alpha = luminance headroom.
    const alpha = clamp(m / 255, 0, 1);
    out[o] = clamp(Math.round(r / alpha), 0, 255);
    out[o + 1] = clamp(Math.round(g / alpha), 0, 255);
    out[o + 2] = clamp(Math.round(b / alpha), 0, 255);
    out[o + 3] = Math.round(alpha * 255);
    continue;
  }

  // Deep-navy wordmark: keep the colour, ramp alpha over the antialias band.
  // Speckles left by the source compression never reach a solid neighbourhood.
  if (localMax[p] < DARK_HI) continue;
  const alpha = smoothstep(DARK_LO, DARK_HI, m);
  out[o] = r;
  out[o + 1] = g;
  out[o + 2] = b;
  out[o + 3] = Math.round(alpha * 255);
}

await mkdir(path.dirname(OUT), { recursive: true });
await sharp(out, { raw: { width, height, channels: 4 } })
  .trim({ threshold: 1 })
  .png({ compressionLevel: 9, palette: false })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(
  `logo v6 → ${OUT} ${meta.width}x${meta.height} aspect ${(meta.width / meta.height).toFixed(3)}`,
);
