#!/usr/bin/env node
/**
 * Verify backup set layout and checksums (ciphertext database artifact).
 * Plaintext pg_dump must not be present in production bundles.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const bundle = path.resolve(process.argv[2] || "");
if (!bundle) {
  console.error("usage: verify-backup-set.mjs <backup-set-dir>");
  process.exit(2);
}

const errors = [];
const manifestPath = path.join(bundle, "manifest.json");
if (!fs.existsSync(manifestPath)) {
  errors.push("missing manifest.json");
}

function sha256File(filePath) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(filePath));
  return h.digest("hex");
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch {
  errors.push("invalid manifest.json");
  manifest = { components: [] };
}

const plainDump = path.join(bundle, "database/hostingbeyond.dump");
if (fs.existsSync(plainDump)) {
  errors.push("plaintext database dump must not be present in backup set");
}

const dumpAge = path.join(bundle, "database/hostingbeyond.dump.age");
if (!fs.existsSync(dumpAge)) {
  errors.push("missing database/hostingbeyond.dump.age");
} else if (fs.statSync(dumpAge).size < 256) {
  errors.push("database ciphertext suspiciously small");
}

for (const c of manifest.components || []) {
  const p = path.join(bundle, c.path);
  if (!fs.existsSync(p)) {
    errors.push(`missing component ${c.path}`);
    continue;
  }
  const size = fs.statSync(p).size;
  if (c.bytes != null && size !== c.bytes) {
    errors.push(`size mismatch ${c.path}`);
  }
  if (c.sha256) {
    const got = sha256File(p);
    if (got !== c.sha256) errors.push(`checksum mismatch ${c.path}`);
  }
}

const sumsPath = path.join(bundle, "checksums/SHA256SUMS");
if (fs.existsSync(sumsPath)) {
  for (const line of fs.readFileSync(sumsPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const [hash, ...rest] = t.split(/\s+/);
    const rel = rest.join(" ");
    const p = path.join(bundle, rel);
    if (!fs.existsSync(p)) {
      errors.push(`SHA256SUMS references missing file ${rel}`);
      continue;
    }
    if (sha256File(p) !== hash) errors.push(`SHA256SUMS mismatch ${rel}`);
  }
}

const backupSetId = manifest.backupSetId || path.basename(bundle);
const result = {
  backupSetId,
  verifiedAt: new Date().toISOString(),
  status: errors.length === 0 ? "PASS" : "FAIL",
  errors,
  encryptedDatabaseOnly: !fs.existsSync(plainDump) && fs.existsSync(dumpAge),
  decryptTest: "PENDING",
};

if (errors.length === 0 && fs.existsSync(manifestPath)) {
  try {
    manifest.verification = {
      status: "PASS",
      verifiedAt: result.verifiedAt,
      layer: "structure-and-checksums",
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  } catch {
    /* non-fatal */
  }
}

const reportDir = process.env.HB_VERIFY_REPORT_DIR;
if (reportDir) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, `verify-${result.backupSetId}.json`),
    JSON.stringify(result, null, 2),
  );
}

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
process.exit(errors.length === 0 ? 0 : 1);
