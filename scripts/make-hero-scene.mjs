import sharp from "sharp";

/**
 * Soft cream-blue edge dissolve + kill upper-left white haze.
 * Subject crop/zoom unchanged.
 */
const SRC =
  process.argv[2] || "public/images/hero-speaker-scene-src.png";
const OUT = "public/images/hero-speaker-scene-v3.png";
const PREVIEW = "tmp-assets/scene-final-preview.png";

const BG = { r: 238, g: 243, b: 251 }; // #eef3fb
const BG_TOP = { r: 232, g: 240, b: 250 }; // #e8f0fa

const targetW = 1400;
const targetH = 1050;

const { data, info } = await sharp(SRC)
  .resize(targetW, targetH, { fit: "cover", position: "north" })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.alloc(info.width * info.height * 4);
const width = info.width;
const height = info.height;

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function bgAt(ny) {
  const t = smoothstep(0, 0.35, ny);
  return {
    r: Math.round(BG_TOP.r * (1 - t) + BG.r * t),
    g: Math.round(BG_TOP.g * (1 - t) + BG.g * t),
    b: Math.round(BG_TOP.b * (1 - t) + BG.b * t),
  };
}

function mixToward(r, g, b, amount, bg) {
  return {
    r: Math.round(r * (1 - amount) + bg.r * amount),
    g: Math.round(g * (1 - amount) + bg.g * amount),
    b: Math.round(b * (1 - amount) + bg.b * amount),
  };
}

function isSkin(r, g, b) {
  return (
    r > 100 &&
    g > 60 &&
    b > 45 &&
    r > g + 8 &&
    r > b + 12 &&
    r - g < 90
  );
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const si = (y * width + x) * 3;
    const di = (y * width + x) * 4;
    let r = data[si];
    let g = data[si + 1];
    let b = data[si + 2];

    const nx = x / width;
    const ny = y / height;
    const bg = bgAt(ny);
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);

    const left = 1 - smoothstep(0, 0.14, nx);
    const top = 1 - smoothstep(0, 0.08, ny);
    const right = smoothstep(0.93, 1, nx);
    const bottom = smoothstep(0.91, 1, ny);
    const edge = Math.min(
      1,
      Math.max(left * 0.9, right * 0.5, top * 0.72, bottom * 0.65, left * top),
    );

    const flare = nx < 0.42 && ny < 0.42;
    const behindGlass = nx < 0.34 && ny > 0.1 && ny < 0.62;
    const protectRight = nx > 0.45;

    if (!isSkin(r, g, b) && !protectRight) {
      if (lum > 190 && sat < 50) {
        let amt = 0.55 + smoothstep(190, 252, lum) * 0.45;
        if (flare) amt = 1;
        else if (behindGlass) amt = Math.min(1, amt + 0.35);
        ({ r, g, b } = mixToward(r, g, b, amt, bg));
      } else if (flare && lum > 155 && sat < 40) {
        ({ r, g, b } = mixToward(r, g, b, 0.75, bg));
      } else if (behindGlass && lum > 150 && sat < 45) {
        ({ r, g, b } = mixToward(r, g, b, 0.55, bg));
      } else {
        ({ r, g, b } = mixToward(r, g, b, 0.03, bg));
      }
    } else if (!isSkin(r, g, b) && protectRight && lum > 220 && sat < 25) {
      ({ r, g, b } = mixToward(r, g, b, 0.35, bg));
    }

    if (edge > 0) ({ r, g, b } = mixToward(r, g, b, edge, bg));

    out[di] = r;
    out[di + 1] = g;
    out[di + 2] = b;
    out[di + 3] = 255;
  }
}

await sharp(out, {
  raw: { width, height, channels: 4 },
})
  .png({ compressionLevel: 8 })
  .toFile(OUT);

await sharp(OUT).toFile(PREVIEW);

console.log({ bg: "#eef3fb", mode: "cream-ul-flare-fix" });
