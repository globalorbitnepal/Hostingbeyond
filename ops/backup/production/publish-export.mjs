#!/usr/bin/env node
/**
 * Write outer-bundle metadata and update LATEST symlinks after encryption succeeded.
 * Does not encrypt or delete ciphertext. Roll back partial symlink updates on failure.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--export-root") out.exportRoot = argv[++i];
    else if (a === "--backup-set-id") out.backupSetId = argv[++i];
    else if (a === "--ciphertext") out.ciphertext = argv[++i];
    else if (a === "--ciphertext-sha256") out.ciphertextSha256 = argv[++i];
  }
  return out;
}

function atomicWriteJson(filePath, obj) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, filePath);
}

function readSymlinkTarget(linkPath) {
  try {
    if (!fs.existsSync(linkPath)) return null;
    return fs.readlinkSync(linkPath);
  } catch {
    return null;
  }
}

function replaceSymlink(linkPath, target) {
  const dir = path.dirname(linkPath);
  const base = path.basename(linkPath);
  const staging = path.join(dir, `.${base}.staging-${process.pid}`);
  fs.symlinkSync(target, staging);
  fs.renameSync(staging, linkPath);
}

export function publishExportArtifacts({
  exportRoot,
  backupSetId,
  ciphertextPath,
  ciphertextSha256,
}) {
  if (!exportRoot || !backupSetId || !ciphertextPath || !ciphertextSha256) {
    throw new Error("missing required publish arguments");
  }
  const root = path.resolve(exportRoot);
  const cipher = path.resolve(ciphertextPath);
  if (!fs.existsSync(cipher)) {
    throw new Error("ciphertext missing");
  }

  const metaPath = path.join(root, `${backupSetId}.bundle.meta.json`);
  const meta = {
    backupSetId,
    ciphertextPath: cipher,
    ciphertextSha256,
    encryption: "age",
    plaintextDatabaseOnServer: false,
    createdAt: new Date().toISOString(),
  };
  atomicWriteJson(metaPath, meta);

  const ageLink = path.join(root, "LATEST.bundle.tar.age");
  const metaLink = path.join(root, "LATEST.bundle.meta.json");
  const prevAge = readSymlinkTarget(ageLink);
  const prevMeta = readSymlinkTarget(metaLink);

  try {
    replaceSymlink(ageLink, cipher);
    replaceSymlink(metaLink, metaPath);
  } catch (e) {
    try {
      if (prevAge != null) replaceSymlink(ageLink, prevAge);
      else if (fs.existsSync(ageLink)) fs.unlinkSync(ageLink);
    } catch {
      /* best effort */
    }
    try {
      if (prevMeta != null) replaceSymlink(metaLink, prevMeta);
      else if (fs.existsSync(metaLink)) fs.unlinkSync(metaLink);
    } catch {
      /* best effort */
    }
    try {
      if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    } catch {
      /* best effort */
    }
    throw e;
  }

  return { metaPath, ageLink, metaLink };
}

const isMain =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  const args = parseArgs(process.argv);
  try {
    const r = publishExportArtifacts({
      exportRoot: args.exportRoot,
      backupSetId: args.backupSetId,
      ciphertextPath: args.ciphertext,
      ciphertextSha256: args.ciphertextSha256,
    });
    process.stdout.write(`${r.metaPath}\n`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "publish failed";
    console.error(`publish-export: ${msg}`);
    process.exit(9);
  }
}
