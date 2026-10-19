#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--bundle") out.bundle = argv[++i];
    else if (a === "--timestamp") out.timestamp = argv[++i];
    else if (a === "--db-name") out.dbName = argv[++i];
    else if (a === "--git-commit") out.gitCommit = argv[++i];
    else if (a === "--file-count") out.fileCount = Number(argv[++i]);
    else if (a === "--total-bytes") out.totalBytes = Number(argv[++i]);
  }
  return out;
}

function sha256File(filePath) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(filePath));
  return h.digest("hex");
}

const args = parseArgs(process.argv);
if (!args.bundle || !args.timestamp) {
  console.error("usage: build-manifest.mjs --bundle <dir> --timestamp <ts> ...");
  process.exit(2);
}

const bundle = path.resolve(args.bundle);
const dumpAge = path.join(bundle, "database/hostingbeyond.dump.age");
const dumpPlain = path.join(bundle, "database/hostingbeyond.dump");
if (!fs.existsSync(dumpAge)) {
  console.error("build-manifest: missing required database/hostingbeyond.dump.age");
  process.exit(10);
}
if (fs.existsSync(dumpPlain)) {
  console.error("build-manifest: plaintext database dump must not remain in bundle");
  process.exit(11);
}

const components = [];
for (const rel of ["database/hostingbeyond.dump.age", "checksums/SHA256SUMS"]) {
  const p = path.join(bundle, rel);
  if (fs.existsSync(p)) {
    components.push({
      path: rel,
      bytes: fs.statSync(p).size,
      sha256: sha256File(p),
    });
  }
}

for (const sub of ["files", "metadata"]) {
  const dir = path.join(bundle, sub);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (!fs.statSync(p).isFile()) continue;
    const rel = `${sub}/${name}`;
    components.push({
      path: rel,
      bytes: fs.statSync(p).size,
      sha256: sha256File(p),
    });
  }
}

let aggregates = {};
const aggPath = path.join(bundle, "metadata/source-aggregates.json");
if (fs.existsSync(aggPath)) {
  try {
    aggregates = JSON.parse(fs.readFileSync(aggPath, "utf8"));
  } catch {
    aggregates = {};
  }
}

const manifest = {
  schemaVersion: 2,
  backupSetId: args.timestamp,
  databaseArtifact: {
    path: "database/hostingbeyond.dump.age",
    format: "pg_dump-custom+age",
    plaintext: false,
  },
  createdAt: new Date().toISOString(),
  hostIdentifier: "hostingbeyond-production-vps",
  databaseName: args.dbName || "unknown",
  gitCommit: args.gitCommit || "unknown",
  componentCount: components.length,
  fileCount: args.fileCount || components.length,
  totalBytes: args.totalBytes || 0,
  components,
  sourceAggregates: aggregates,
  verification: {
    status: "pending",
    verifiedAt: null,
  },
};

const outPath = path.join(bundle, "manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
// manifest.json is NOT listed in components (avoids self-hash ambiguity).
// Integrity: checksums/SHA256SUMS includes manifest.json after build-manifest runs.
manifest.manifestNote =
  "manifest.json checksum is in checksums/SHA256SUMS only, not in components[]";
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
process.stdout.write(outPath + "\n");
