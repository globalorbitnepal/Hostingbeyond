/**
 * Professional purple/blue motion graphics — canvas frame render → H.264 (no images/slides).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/images/domains/videos");
const FPS = 30;
const DURATION = 6;
const FRAMES = FPS * DURATION;
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";

const C = {
  purple: "#673de6",
  purpleDark: "#2f1c6a",
  purpleDeep: "#1e1b4b",
  blue: "#2563eb",
  blueLight: "#60a5fa",
  indigo: "#4338ca",
  bgLight: "#f4f5ff",
  bgSoft: "#eef2ff",
  white: "#ffffff",
  slate: "#64748b",
  green: "#22c55e",
};

GlobalFonts.registerFromPath(FONT_BOLD, "Bold");
GlobalFonts.registerFromPath(FONT, "Regular");

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function loopT(frame) {
  return (frame / FRAMES) % 1;
}

/** Per-card zoom so UI fills the bento frame under object-cover (not tiny centered). */
const SCENE_VIEW = {
  registrar: { scale: 1.12, fx: 0.5, fy: 0.5 },
  privacy: { scale: 1.38, fx: 0.5, fy: 0.5 },
  support: { scale: 1.1, fx: 0.5, fy: 0.5 },
  setup: { scale: 1.12, fx: 0.5, fy: 0.5 },
};

function beginZoom(ctx, w, h, view) {
  const { scale, fx = 0.5, fy = 0.5 } = view;
  ctx.save();
  ctx.translate(w * fx, h * fy);
  ctx.scale(scale, scale);
  ctx.translate(-w * fx, -h * fy);
}

function endZoom(ctx) {
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function shadow(ctx, blur = 28, color = "rgba(103,61,230,0.22)") {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = 12;
}

function clearShadow(ctx) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function bgPurpleBlue(ctx, w, h, frame, dark = false) {
  const t = loopT(frame);
  const g = ctx.createLinearGradient(0, 0, w, h);
  if (dark) {
    g.addColorStop(0, `rgb(${30 + 8 * Math.sin(t * Math.PI * 2)}, ${27 + 6 * Math.sin(t * Math.PI * 2)}, ${75 + 10 * Math.sin(t * Math.PI * 2)})`);
    g.addColorStop(0.45, "#1e1b4b");
    g.addColorStop(1, "#0f172a");
  } else {
    g.addColorStop(0, "#ede9fe");
    g.addColorStop(0.5, "#dbeafe");
    g.addColorStop(1, "#e0e7ff");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 3; i++) {
    const ox = w * (0.2 + i * 0.25) + Math.sin(t * Math.PI * 2 + i) * 40;
    const oy = h * (0.15 + i * 0.2) + Math.cos(t * Math.PI * 2 + i * 0.7) * 30;
    const rad = 120 + i * 40;
    const orb = ctx.createRadialGradient(ox, oy, 0, ox, oy, rad);
    orb.addColorStop(0, `rgba(103,61,230,${dark ? 0.35 : 0.18})`);
    orb.addColorStop(1, "rgba(37,99,235,0)");
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawRegistrar(frame) {
  const w = 960;
  const h = 1200;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const t = loopT(frame);
  bgPurpleBlue(ctx, w, h, frame, false);
  beginZoom(ctx, w, h, SCENE_VIEW.registrar);

  const cardX = 20;
  const cardW = w - 40;
  const cardH = h - 40;
  const cardY = 20;
  shadow(ctx);
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fill();
  clearShadow(ctx);

  const searchY = cardY + 48;
  roundRect(ctx, cardX + 28, searchY, cardW - 56, 88, 18);
  ctx.fillStyle = C.bgLight;
  ctx.fill();
  ctx.strokeStyle = "#e0e7ff";
  ctx.lineWidth = 1;
  ctx.stroke();

  const pulse = 1 + 0.35 * Math.sin((frame / FPS) * Math.PI * 2 / 1.2);
  ctx.fillStyle = C.purple;
  ctx.beginPath();
  ctx.arc(cardX + 52, searchY + 44, 6 * pulse, 0, Math.PI * 2);
  ctx.fill();

  const exts = [".com", ".io", ".shop", ".ai"];
  const extIdx = Math.floor((frame / (FPS * 0.9)) % exts.length);
  const domain = `yourbrand${exts[extIdx]}`;
  ctx.font = "34px Bold";
  ctx.fillStyle = C.purpleDark;
  ctx.fillText(domain, cardX + 72, searchY + 56);
  if (Math.floor(frame / 15) % 2 === 0) {
    const tw = ctx.measureText(domain).width;
    ctx.fillRect(cardX + 68 + tw + 4, searchY + 24, 2, 28);
  }

  roundRect(ctx, cardX + cardW - 28 - 176, searchY + 14, 176, 60, 14);
  ctx.fillStyle = C.purple;
  ctx.fill();
  ctx.font = "22px Bold";
  ctx.fillStyle = C.white;
  ctx.fillText("Search", cardX + cardW - 28 - 128, searchY + 52);

  const pills = ["ICANN-accredited", "300+ extensions", "Renewal shown upfront"];
  ctx.font = "17px Bold";
  let pillX = cardX + 24;
  let pillY = cardY + 168;
  pills.forEach((label, i) => {
    const appear = ease(Math.min(1, Math.max(0, (frame - i * 10) / 18)));
    const pw = ctx.measureText(label).width + 36;
    if (pillX + pw > cardX + cardW - 24) {
      pillX = cardX + 24;
      pillY += 44;
    }
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.translate(0, (1 - appear) * 10);
    roundRect(ctx, pillX, pillY, pw, 36, 18);
    ctx.fillStyle = C.bgSoft;
    ctx.fill();
    ctx.fillStyle = C.indigo;
    ctx.fillText(label, pillX + 14, pillY + 24);
    ctx.restore();
    pillX += pw + 10;
  });

  ctx.font = "18px Bold";
  ctx.fillStyle = C.purpleDark;
  ctx.fillText("Free WHOIS privacy", cardX + 28, cardY + h - cardY - 120);
  roundRect(ctx, cardX + cardW - 88, cardY + h - cardY - 138, 56, 32, 16);
  ctx.fillStyle = C.purple;
  ctx.fill();
  const knobY = cardY + h - cardY - 122;
  const knobX = cardX + cardW - 48 + Math.sin(t * Math.PI * 2) * 4;
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(knobX, knobY, 11, 0, Math.PI * 2);
  ctx.fill();

  const barY = cardY + h - cardY - 72;
  roundRect(ctx, cardX + 28, barY, cardW - 56, 12, 6);
  ctx.fillStyle = "#e0e7ff";
  ctx.fill();
  const prog = 0.35 + 0.57 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
  const grad = ctx.createLinearGradient(cardX + 24, 0, cardX + 24 + (cardW - 48) * prog, 0);
  grad.addColorStop(0, C.purple);
  grad.addColorStop(1, C.blue);
  roundRect(ctx, cardX + 28, barY, (cardW - 56) * prog, 12, 6);
  ctx.fillStyle = grad;
  ctx.fill();

  endZoom(ctx);
  return canvas;
}

function drawShield(ctx, cx, cy, scale, float) {
  const sy = cy + float;
  ctx.save();
  ctx.translate(cx, sy);
  ctx.scale(scale, scale);
  const g = ctx.createLinearGradient(0, -80, 0, 100);
  g.addColorStop(0, C.blueLight);
  g.addColorStop(1, C.blue);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -90);
  ctx.lineTo(70, -55);
  ctx.lineTo(55, 70);
  ctx.lineTo(0, 95);
  ctx.lineTo(-55, 70);
  ctx.lineTo(-70, -55);
  ctx.closePath();
  ctx.shadowColor = "rgba(96,165,250,0.55)";
  ctx.shadowBlur = 40;
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = C.white;
  roundRect(ctx, -18, -15, 36, 28, 6);
  ctx.fill();
  ctx.fillStyle = C.blue;
  ctx.beginPath();
  ctx.arc(0, 8, 10, 0, Math.PI);
  ctx.fill();
  ctx.restore();
}

function drawPrivacy(frame) {
  const w = 1600;
  const h = 800;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const t = loopT(frame);
  bgPurpleBlue(ctx, w, h, frame, true);
  beginZoom(ctx, w, h, SCENE_VIEW.privacy);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  const off = (frame * 1.2) % 40;
  for (let x = -40 + off; x < w + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = -40 + off; y < h + 40; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  for (let r = 0; r < 3; r++) {
    const phase = (t * DURATION + r * 0.8) % 2.4;
    const alpha = Math.max(0, 1 - phase / 2.4) * 0.45;
    const radius = 80 + phase * 90;
    ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(400, h / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  const float = Math.sin(t * Math.PI * 2) * 12;
  drawShield(ctx, 400, h / 2, 1.35, float);

  const rows = [
    ["WHOIS privacy", "ON"],
    ["SSL certificate", "Active"],
    ["Contact details", "Hidden"],
  ];
  const tSec = (frame / FPS) % DURATION;
  rows.forEach(([label, val], i) => {
    const delay = 0.2 + i * 0.35;
    const slide = ease(Math.min(1, Math.max(0, (tSec - delay) * 2.2)));
    const rx = 780 + (1 - slide) * 60;
    const ry = 200 + i * 108;
    ctx.globalAlpha = slide;
    roundRect(ctx, rx, ry, 460, 80, 16);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.stroke();
    ctx.font = "24px Bold";
    ctx.fillStyle = C.white;
    ctx.fillText(label, rx + 22, ry + 48);
    ctx.fillStyle = val === "Hidden" ? "rgba(255,255,255,0.75)" : C.green;
    ctx.fillText(val, rx + 350, ry + 48);
    ctx.globalAlpha = 1;
  });

  endZoom(ctx);
  return canvas;
}

function drawSupport(frame) {
  const w = 1344;
  const h = 960;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  bgPurpleBlue(ctx, w, h, frame, false);
  beginZoom(ctx, w, h, SCENE_VIEW.support);

  const mx = 16;
  const my = 16;
  const mw = w - 32;
  const mh = h - 32;
  shadow(ctx, 36);
  roundRect(ctx, mx, my, mw, mh, 24);
  ctx.fillStyle = C.white;
  ctx.fill();
  clearShadow(ctx);

  roundRect(ctx, mx, my, mw, 72, 24);
  ctx.fillStyle = C.purple;
  ctx.fill();
  ctx.fillRect(mx, my + 48, mw, 24);
  ctx.font = "28px Bold";
  ctx.fillStyle = C.white;
  ctx.fillText("HostingBeyond Support", mx + 22, my + 48);
  const livePulse = 0.85 + 0.15 * Math.sin((frame / FPS) * Math.PI * 2);
  roundRect(ctx, mx + mw - 130, my + 18, 110, 32, 16);
  ctx.fillStyle = `rgba(34,197,94,${livePulse})`;
  ctx.fill();
  ctx.font = "13px Bold";
  ctx.fillStyle = C.white;
  ctx.fillText("24/7 Live", mx + mw - 108, my + 40);

  const msgs = [
    { text: "Hi — help connecting my domain to hosting.", agent: false, at: 0.5 },
    { text: "I can walk you through DNS in one panel.", agent: true, at: 1.4 },
    { text: "Buying my first .com today.", agent: false, at: 2.3 },
    { text: "Domain pointed — SSL is on.", agent: true, at: 3.2 },
  ];
  const tSec = (frame / FPS) % DURATION;
  let y = my + 96;
  msgs.forEach((m) => {
    const show = ease(Math.min(1, Math.max(0, (tSec - m.at) * 2)));
    if (show <= 0) return;
    ctx.font = "20px Regular";
    const tw = Math.min(560, ctx.measureText(m.text).width + 36);
    const bx = m.agent ? mx + mw - tw - 24 : mx + 24;
    ctx.globalAlpha = show;
    ctx.translate(0, (1 - show) * 14);
    roundRect(ctx, bx, y, tw, 64, 14);
    ctx.fillStyle = m.agent ? C.purple : "#f1f5f9";
    ctx.fill();
    ctx.fillStyle = m.agent ? C.white : C.purpleDark;
    ctx.fillText(m.text, bx + 16, y + 36);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    y += 78;
  });

  const ty = my + mh - 88;
  roundRect(ctx, mx + mw - 100, ty, 76, 40, 14);
  ctx.fillStyle = C.bgSoft;
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const bounce = Math.sin((frame / FPS) * Math.PI * 2 + i * 0.5) * 5;
    ctx.fillStyle = C.purple;
    ctx.beginPath();
    ctx.arc(mx + mw - 82 + i * 18, ty + 20 + bounce, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  endZoom(ctx);
  return canvas;
}

function drawSetup(frame) {
  const w = 1080;
  const h = 1080;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  bgPurpleBlue(ctx, w, h, frame, false);
  beginZoom(ctx, w, h, SCENE_VIEW.setup);

  const px = 20;
  const py = 20;
  const pw = w - 40;
  const ph = h - 40;
  shadow(ctx);
  roundRect(ctx, px, py, pw, ph, 24);
  ctx.fillStyle = C.white;
  ctx.fill();
  clearShadow(ctx);

  ctx.font = "34px Bold";
  ctx.fillStyle = C.purpleDark;
  ctx.fillText("Quick domain setup", px + 32, py + 56);

  const steps = ["Register domain", "Manage DNS", "Add hosting & mail"];
  const t = loopT(frame);
  steps.forEach((label, i) => {
    const sy = py + 108 + i * 118;
    const phase = (t * DURATION - i * 0.35 + DURATION) % DURATION;
    const prog = ease(Math.min(1, Math.max(0, Math.sin((phase / DURATION) * Math.PI) * 1.2)));
    ctx.fillStyle = C.purple;
    ctx.beginPath();
    ctx.arc(px + 52, sy + 24, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "20px Bold";
    ctx.fillStyle = C.white;
    ctx.fillText("✓", px + 44, sy + 30);
    ctx.font = "24px Bold";
    ctx.fillStyle = C.purpleDark;
    ctx.fillText(label, px + 92, sy + 30);
    roundRect(ctx, px + 92, sy + 44, pw - 124, 10, 5);
    ctx.fillStyle = "#e2e8f0";
    ctx.fill();
    const grad = ctx.createLinearGradient(px + 92, 0, px + 92 + (pw - 124) * prog, 0);
    grad.addColorStop(0, C.purple);
    grad.addColorStop(1, C.blue);
    roundRect(ctx, px + 92, sy + 44, (pw - 124) * prog, 10, 5);
    ctx.fillStyle = grad;
    ctx.fill();
  });

  const glow = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
  shadow(ctx, 20 + glow * 20, `rgba(103,61,230,${0.25 + glow * 0.25})`);
  roundRect(ctx, px + pw / 2 - 120, py + ph - 72, 240, 52, 26);
  ctx.fillStyle = C.purple;
  ctx.fill();
  clearShadow(ctx);
  ctx.font = "22px Bold";
  ctx.fillStyle = C.white;
  ctx.fillText("Go live", px + pw / 2 - 42, py + ph - 40);

  endZoom(ctx);
  return canvas;
}

async function exportPreviewFrames(scenes) {
  const dir = path.join(root, ".tmp/bento-previews");
  fs.mkdirSync(dir, { recursive: true });
  for (const { id, draw } of scenes) {
    for (const f of [0, Math.floor(FRAMES / 2), FRAMES - 1]) {
      const canvas = draw(f);
      const png = await canvas.encode("png");
      fs.writeFileSync(path.join(dir, `${id}-f${f}.png`), png);
    }
  }
  console.log(`Previews: ${dir}`);
}

const SCENES = [
  { id: "bento-registrar", draw: drawRegistrar },
  { id: "bento-privacy", draw: drawPrivacy },
  { id: "bento-support", draw: drawSupport },
  { id: "bento-setup", draw: drawSetup },
];

async function ffmpegBin() {
  try {
    const mod = await import("ffmpeg-static");
    if (mod.default && fs.existsSync(mod.default)) return mod.default;
  } catch {
    /* */
  }
  const p = "/tmp/vidgen/node_modules/ffmpeg-static/ffmpeg";
  return fs.existsSync(p) ? p : "ffmpeg";
}

function encodeScene(ffmpeg, id, draw) {
  return new Promise((resolve, reject) => {
    const out = path.join(outDir, `${id}.mp4`);
    const sample = draw(0);
    const w = sample.width;
    const h = sample.height;
    const ff = spawn(
      ffmpeg,
      [
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgba",
        "-s",
        `${w}x${h}`,
        "-r",
        String(FPS),
        "-i",
        "pipe:0",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "19",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        out,
      ],
      { stdio: ["pipe", "inherit", "inherit"] },
    );
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code !== 0) reject(new Error(`encode failed ${id}`));
      else {
        const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(2);
        console.log(`${id}.mp4 ${mb} MB (${w}x${h})`);
        resolve();
      }
    });
    for (let f = 0; f < FRAMES; f++) {
      const buf = draw(f).data();
      ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength));
    }
    ff.stdin.end();
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  await exportPreviewFrames(SCENES);
  const ffmpeg = await ffmpegBin();
  for (const scene of SCENES) {
    await encodeScene(ffmpeg, scene.id, scene.draw);
  }
  await exportPreviewFrames(SCENES);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
