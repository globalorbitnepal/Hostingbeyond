import fs from "fs";
import path from "path";

const DIR = "tmp-assets/si";
const OUT = "public/images/partners";

function extractPath(svg) {
  const m = svg.match(/<path[^>]*\sd="([^"]+)"/);
  if (!m) throw new Error("no path");
  return m[1];
}

/** Match WordPress visual weight — not bigger than WP */
const marks = {
  cpanel: { color: "#FF6C2C", scale: 1.55 },
  plesk: { color: "#52BBE6", scale: 1.62 },
  intel: { color: "#0071C5", scale: 1.68 },
  amd: { color: "#ED1C24", scale: 1.75 },
  php: { color: "#777BB4", scale: 1.22 },
  mysql: { color: "#4479A1", scale: 1.28 },
};

for (const [id, { color, scale }] of Object.entries(marks)) {
  const d = extractPath(fs.readFileSync(path.join(DIR, `${id}.svg`), "utf8"));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" width="170" height="40" aria-label="${id}">
  <title>${id}</title>
  <g transform="translate(12 12) scale(${scale}) translate(-12 -12)">
    <path fill="${color}" d="${d}"/>
  </g>
</svg>
`;
  fs.writeFileSync(path.join(OUT, `${id}.svg`), svg);
  console.log("mark", id, scale);
}

const icons = {
  wordpress: {
    color: "#21759B",
    label: "WordPress",
    font: "Georgia, 'Times New Roman', Times, serif",
    w: 185,
    iconScale: 1.22,
    fontSize: 17,
  },
  linux: {
    color: "#FCC624",
    label: "Linux",
    textColor: "#111827",
    font: "Arial, Helvetica, sans-serif",
    w: 150,
    iconScale: 1.22,
    fontSize: 17,
  },
  python: {
    color: "#3776AB",
    label: "Python",
    font: "Arial, Helvetica, sans-serif",
    w: 155,
    iconScale: 1.22,
    fontSize: 17,
  },
  docker: {
    color: "#2496ED",
    label: "Docker",
    font: "Arial, Helvetica, sans-serif",
    w: 155,
    iconScale: 1.18,
    fontSize: 17,
  },
};

for (const [id, cfg] of Object.entries(icons)) {
  const d = extractPath(fs.readFileSync(path.join(DIR, `${id}.svg`), "utf8"));
  const textColor = cfg.textColor || cfg.color;
  const yPad = ((40 - 24 * cfg.iconScale) / 2).toFixed(1);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${cfg.w} 40" width="${cfg.w}" height="40" aria-label="${cfg.label}">
  <title>${cfg.label}</title>
  <g transform="translate(2,${yPad}) scale(${cfg.iconScale})">
    <path fill="${cfg.color}" d="${d}"/>
  </g>
  <text x="38" y="27" fill="${textColor}" font-family="${cfg.font}" font-size="${cfg.fontSize}" font-weight="700">${cfg.label}</text>
</svg>
`;
  fs.writeFileSync(path.join(OUT, `${id}.svg`), svg);
  console.log("icon", id);
}

fs.writeFileSync(
  path.join(OUT, "nvme.svg"),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 175 40" width="175" height="40" aria-label="nvme EXPRESS">
  <title>nvme EXPRESS</title>
  <text x="2" y="27" fill="#0F172A" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="800" letter-spacing="0.3">nvme</text>
  <text x="68" y="27" fill="#0284C7" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="1.4">EXPRESS</text>
  <path fill="#0284C7" d="M158 11h13l-4.5 6.5 4.5 6.5h-13l4.5-6.5z"/>
</svg>
`,
);
console.log("done");
