/**
 * Procedural motion graphics for domain bento cards (no still images, no xfade slides).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public/images/domains/videos");
const DURATION = 6;
const FPS = 30;
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

async function ffmpegBin() {
  try {
    const mod = await import("ffmpeg-static");
    if (mod.default && fs.existsSync(mod.default)) return mod.default;
  } catch {
    /* fall through */
  }
  const fallback = "/tmp/vidgen/node_modules/ffmpeg-static/ffmpeg";
  if (fs.existsSync(fallback)) return fallback;
  return "ffmpeg";
}

function run(ffmpeg, id, size, vf, base = "0x1e1b4b") {
  const [w, h] = size;
  const out = path.join(outDir, `${id}.mp4`);
  const args = [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${base}:s=${w}x${h}:r=${FPS}:d=${DURATION}`,
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    out,
  ];
  const r = spawnSync(ffmpeg, args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`ffmpeg failed: ${id}`);
  }
  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(2);
  console.log(`${id}.mp4 ${mb} MB`);
}

function dt(text, opts = "") {
  const esc = (s) =>
    s.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
  return `drawtext=fontfile=${FONT}:text='${esc(text)}':${opts}`;
}

function registrarVf() {
  const bg = `hue=H=8*sin(2*PI*t/${DURATION}):s=1`;
  const card = `drawbox=x=48:y=320:w=864:h=520:color=white@0.94:t=fill`;
  const searchBar = `drawbox=x=72:y=360:w=816:h=72:color=0xf4f5ff@1:t=fill`;
  const pulse = `drawbox=x=88:y=392:w='10+6*sin(2*PI*t/1.2)':h='10+6*sin(2*PI*t/1.2)':color=0x673de6@1:t=fill`;
  const btn = `drawbox=x=720:y=372:w=150:h=48:color=0x673de6@1:t=fill,${dt("Search", "fontsize=22:fontcolor=white:x=748:y=384")}`;
  const exts = [".com", ".io", ".shop", ".ai"];
  const texts = exts
    .map((ext, i) => {
      const t0 = i * 0.9;
      const t1 = t0 + 0.85;
      return dt(`yourbrand${ext}`, `fontsize=28:fontcolor=0x2f1c6a:x=120:y=382:enable='between(t,${t0},${t1})'`);
    })
    .join(",");
  const pills = [
    ["ICANN-accredited", 420, 0.2],
    ["300+ extensions", 520, 0.5],
    ["Renewal upfront", 620, 0.8],
  ]
    .map(([label, y, delay]) => {
      const en = `between(t\\,${delay}\\,${DURATION})`;
      return `drawbox=x=72:y=${y}:w=280:h=40:color=0xeef2ff@1:t=fill:enable='${en}',${dt(label, `fontsize=16:fontcolor=0x4338ca:x=88:y=${y + 10}:enable='${en}'`)}`;
    })
    .join(",");
  const barBg = `drawbox=x=72:y=700:w=816:h=10:color=0xe0e7ff@1:t=fill`;
  const barFill = `drawbox=x=72:y=700:w='80+700*abs(sin(2*PI*t/3))':h=10:color=0x673de6@1:t=fill`;
  const toggle = `${dt("Free WHOIS privacy", "fontsize=20:fontcolor=0x2f1c6a:x=72:y=660")},drawbox=x=780:y=658:w=52:h=28:color=0x673de6@1:t=fill`;
  return [bg, card, searchBar, pulse, btn, texts, pills, toggle, barBg, barFill].join(",");
}

function privacyVf() {
  const bg = `geq=r='20+30*sin(0.01*X+2*PI*T/${DURATION})':g='25+40*sin(0.01*Y+2*PI*T/${DURATION})':b='80+50*sin(0.008*(X+Y)+2*PI*T/${DURATION})'`;
  const grid = `drawgrid=w=40:h=40:t=1:c=white@0.06`;
  const shield = `drawbox=x=200:y=220:w=200:h=220:color=0x2563eb@0.9:t=fill,drawbox=x=240:y=260:w=120:h=140:color=0x60a5fa@1:t=fill,${dt("SECURE", "fontsize=28:fontcolor=white:x=248:y=320")}`;
  const ripples = [0, 1.2, 2.4]
    .map(
      (d) =>
        `drawbox=x='400+80*sin(2*PI*(t-${d})/2.4)':y='240+40*cos(2*PI*(t-${d})/2.4)':w='60+80*mod(t-${d}\\,2.4)/2.4':h='60+80*mod(t-${d}\\,2.4)/2.4':color=0x60a5fa@0.25:t=fill`,
    )
    .join(",");
  const rows = [
    ["WHOIS privacy", "ON", 280],
    ["SSL certificate", "Active", 380],
    ["Contact details", "Hidden", 480],
  ]
    .map(([l, r, y], i) => {
      const delay = 0.3 + i * 0.35;
      const en = `gte(t\\,${delay})`;
      return `drawbox=x=720:y=${y}:w=420:h=64:color=white@0.14:t=fill:enable='${en}',${dt(l, `fontsize=22:fontcolor=white:x=740:y=${y + 18}:enable='${en}'`)},${dt(r, `fontsize=22:fontcolor=0x4ade80:x=1040:y=${y + 18}:enable='${en}'`)}`;
    })
    .join(",");
  return [bg, grid, ripples, shield, rows].join(",");
}

function supportVf() {
  const bg = `geq=r='220+20*sin(2*PI*T/${DURATION})':g='225+25*sin(2*PI*T/${DURATION}+1)':b='250+30*sin(2*PI*T/${DURATION}+2)'`;
  const panel = `drawbox=x=80:y=60:w=1184:h=840:color=white@0.98:t=fill`;
  const head = `drawbox=x=80:y=60:w=1184:h=64:color=0x673de6@1:t=fill,${dt("HostingBeyond Support", "fontsize=26:fontcolor=white:x=100:y=78")},drawbox=x=1050:y=78:w=120:h=32:color=0x22c55e@1:t=fill,${dt("24/7 Live", "fontsize=14:fontcolor=white:x=1068:y=86")}`;
  const bubbles = [
    ["Hi — help connecting my domain.", 140, 160, "0xf1f5f9", "0x1e1b4b", 0.4],
    ["I can walk you through DNS.", 900, 260, "0x673de6", "white", 1.2],
    ["Buying my first .com today.", 140, 360, "0xf1f5f9", "0x1e1b4b", 2.0],
    ["Domain pointed — SSL is on.", 820, 460, "0x673de6", "white", 2.8],
  ]
    .map(([msg, x, y, bgc, fg, start]) => {
      const en = `gte(t\\,${start})`;
      return `drawbox=x=${x}:y=${y}:w=520:h=72:color=${bgc}@1:t=fill:enable='${en}',${dt(msg, `fontsize=18:fontcolor=${fg}:x=${x + 16}:y=${y + 22}:enable='${en}'`)}`;
    })
    .join(",");
  const typing = `drawbox=x=900:y=580:w=72:h=40:color=0xede9fe@1:t=fill`;
  const dots = [0, 0.15, 0.3]
    .map(
      (d, i) =>
        `drawbox=x='920+${i * 18}':y='590-6*sin(2*PI*(t-${d}))':w=8:h=8:color=0x673de6@1:t=fill`,
    )
    .join(",");
  return [bg, panel, head, bubbles, typing, dots].join(",");
}

function setupVf() {
  const bg = `geq=r='245+8*sin(2*PI*T/${DURATION})':g='242+10*sin(2*PI*T/${DURATION})':b='255'`;
  const panel = `drawbox=x=80:y=120:w=920:h=840:color=white@0.98:t=fill`;
  const title = dt("Quick domain setup", "fontsize=32:fontcolor=0x1e1b4b:x=120:y=160");
  const steps = [
    ["Register domain", 0],
    ["Manage DNS", 1],
    ["Add hosting and mail", 2],
  ]
    .map(([label, i]) => {
      const y = 240 + i * 120;
      const prog = `min(1,max(0,sin(2*PI*(t-${i * 0.4})/${DURATION})*0.5+0.5))`;
      return `drawbox=x=120:y=${y}:w=44:h=44:color=0x673de6@1:t=fill,${dt("✓", `fontsize=24:fontcolor=white:x=132:y=${y + 8}`)},${dt(label, `fontsize=22:fontcolor=0x1e1b4b:x=180:y=${y + 10}`)},drawbox=x=180:y=${y + 44}:w=760:h=10:color=0xe2e8f0@1:t=fill,drawbox=x=180:y=${y + 44}:w='760*${prog}':h=10:color=0x673de6@1:t=fill`;
    })
    .join(",");
  const pubGlow = `drawbox=x=380:y=720:w=280:h=56:color=0x673de6@1:t=fill,${dt("Go live", "fontsize=24:fontcolor=white:x=460:y=736")}`;
  return [bg, panel, title, steps, pubGlow].join(",");
}

async function main() {
  const ffmpeg = await ffmpegBin();
  fs.mkdirSync(outDir, { recursive: true });
  run(ffmpeg, "bento-registrar", [960, 1200], registrarVf(), "0xede9fe");
  run(ffmpeg, "bento-privacy", [1600, 800], privacyVf(), "0x0f172a");
  run(ffmpeg, "bento-support", [1344, 960], supportVf(), "0xe0e7ff");
  run(ffmpeg, "bento-setup", [1080, 1080], setupVf(), "0xf8f7ff");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
