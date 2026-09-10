import sharp from "sharp";
import fs from "fs";

const [, , input, output, threshArg] = process.argv;
const thresh = Number(threshArg || 28);

function isNearBlack(r, g, b, t) {
  return r < t && g < t && b < t;
}

async function removeBlackBg(inputPath, outputPath, t) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  const visited = new Uint8Array(w * h);
  const q = [];

  function push(x, y) {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visited[i]) return;
    const o = i * ch;
    if (!isNearBlack(data[o], data[o + 1], data[o + 2], t)) return;
    visited[i] = 1;
    q.push(i);
  }

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (q.length) {
    const i = q.pop();
    const o = i * ch;
    data[o + 3] = 0;
    const x = i % w;
    const y = (i / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let i = 0; i < w * h; i++) {
    const o = i * ch;
    if (data[o + 3] === 0) continue;
    const lum = (data[o] + data[o + 1] + data[o + 2]) / 3;
    if (
      lum < t + 8 &&
      isNearBlack(data[o], data[o + 1], data[o + 2], t + 12)
    ) {
      data[o + 3] = Math.max(
        0,
        Math.min(255, Math.round((lum / (t + 12)) * 220)),
      );
    }
  }

  await sharp(Buffer.from(data), {
    raw: { width: w, height: h, channels: ch },
  })
    .png()
    .toFile(outputPath);
  console.log("wrote", outputPath, `${w}x${h}`);
}

fs.mkdirSync("public/logo", { recursive: true });
fs.mkdirSync("public/images", { recursive: true });
await removeBlackBg(input, output, thresh);
