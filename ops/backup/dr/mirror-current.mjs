#!/usr/bin/env node
/**
 * Mirror the newest verified backup set into a fixed folder (e.g. backupRoot/current).
 * Overwrites prior mirror atomically via staging rename — no daily new folder name for owners.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readVerifyStatus,
  validateRetentionRoot,
} from "./retention.mjs";

const FILES_TO_MIRROR = [
  "ciphertext.bundle.tar.age",
  "ciphertext.meta.stderr",
];

export function findNewestVerifiedSet(backupsDir, root) {
  if (!fs.existsSync(backupsDir)) return null;
  const sets = fs
    .readdirSync(backupsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => name !== "_staging")
    .sort();
  const verified = sets.filter((name) =>
    readVerifyStatus(path.join(backupsDir, name), root),
  );
  if (verified.length === 0) return null;
  return verified[verified.length - 1];
}

export function mirrorVerifiedSetToFolder(options) {
  const root = path.resolve(options.backupRoot);
  const mirrorName = options.mirrorFolderName || "current";
  const { ROOT, backupsDir } = validateRetentionRoot(root);
  const setName = findNewestVerifiedSet(backupsDir, ROOT);
  if (!setName) {
    return { action: "skipped", reason: "no verified backup set" };
  }

  const sourceDir = path.join(backupsDir, setName);
  const mirrorRoot = path.join(ROOT, mirrorName);
  const staging = path.join(ROOT, `${mirrorName}._staging`);

  if (fs.existsSync(staging)) {
    fs.rmSync(staging, { recursive: true, force: true });
  }
  fs.mkdirSync(staging, { recursive: true });

  for (const file of FILES_TO_MIRROR) {
    const src = path.join(sourceDir, file);
    if (!fs.existsSync(src)) {
      fs.rmSync(staging, { recursive: true, force: true });
      throw new Error(`mirror-current: missing ${file} in ${setName}`);
    }
    fs.copyFileSync(src, path.join(staging, file));
  }

  const verifySrc = path.join(ROOT, "reports", `verify-${setName}.json`);
  if (fs.existsSync(verifySrc)) {
    fs.copyFileSync(verifySrc, path.join(staging, "verify-report.json"));
  }

  const reportSrc = path.join(ROOT, "reports", "last-run.json");
  if (fs.existsSync(reportSrc)) {
    fs.copyFileSync(reportSrc, path.join(staging, "last-run.json"));
  }

  const pointer = {
    backupSetFolder: setName,
    mirroredAt: new Date().toISOString(),
    files: FILES_TO_MIRROR,
    note: "Decrypt and restore per ops/windows-backup/templates/README-RECOVERY.md",
  };
  fs.writeFileSync(
    path.join(staging, "MIRROR.json"),
    `${JSON.stringify(pointer, null, 2)}\n`,
    "utf8",
  );

  if (fs.existsSync(mirrorRoot)) {
    fs.rmSync(mirrorRoot, { recursive: true, force: true });
  }
  fs.renameSync(staging, mirrorRoot);

  return {
    action: "mirrored",
    backupSetFolder: setName,
    mirrorPath: mirrorRoot,
  };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const root = process.argv[2] || "";
  const folderFlag = process.argv.indexOf("--folder");
  const folderName =
    folderFlag >= 0 && process.argv[folderFlag + 1]
      ? process.argv[folderFlag + 1]
      : "current";
  if (!root) {
    console.error("usage: mirror-current.mjs <backupRoot> [--folder current]");
    process.exit(2);
  }
  try {
    const result = mirrorVerifiedSetToFolder({
      backupRoot: root,
      mirrorFolderName: folderName,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exit(result.action === "skipped" ? 12 : 0);
  } catch (err) {
    console.error(String(err.message || err));
    process.exit(1);
  }
}
