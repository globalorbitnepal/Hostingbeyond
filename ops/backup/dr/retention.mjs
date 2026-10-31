#!/usr/bin/env node
/**
 * Retention for Windows backup root. Never deletes newest verified or last-known-good.
 * Weekly: keep 8; monthly: keep 12 (first verified set per calendar month).
 *
 * A backup set is "verified" for retention only when reports/verify-<folder>.json has:
 *   status === "PASS", backupSetFinalized === true, and backupSetFolder matches folder (if set).
 *
 * Legacy: PASS reports without backupSetFinalized, manifest-only verification, or mismatched
 * backupSetFolder are NOT treated as verified — they are never deleteCandidates (safe).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {string} setDir absolute path to backups/<name>
 * @param {string} root backup root (parent of backups/ and reports/)
 */
/**
 * Resolve and validate backup retention root. Refuses filesystem root and shallow paths.
 * Deletions are always scoped under `<root>/backups/<setName>`.
 */
export function validateRetentionRoot(root) {
  const ROOT = path.resolve(root);
  const fsRoot = path.parse(ROOT).root;
  if (ROOT === fsRoot) {
    throw new Error("retention: refused filesystem root");
  }
  const segments = ROOT.split(path.sep).filter(Boolean);
  if (segments.length < 2) {
    throw new Error("retention: refused shallow backup root");
  }
  const backupsDir = path.join(ROOT, "backups");
  if (!fs.existsSync(backupsDir) || !fs.statSync(backupsDir).isDirectory()) {
    throw new Error("retention: missing backups/ directory under root");
  }
  return { ROOT, backupsDir };
}

export function resolveBackupSetDir(backupsDir, setName) {
  if (!setName || setName === "." || setName === ".." || setName.includes("/")) {
    throw new Error("retention: invalid backup set name");
  }
  const resolved = path.resolve(backupsDir, setName);
  const backupsResolved = path.resolve(backupsDir);
  const prefix = backupsResolved.endsWith(path.sep)
    ? backupsResolved
    : backupsResolved + path.sep;
  if (!resolved.startsWith(prefix)) {
    throw new Error("retention: backup set path outside backups/");
  }
  return resolved;
}

export function readVerifyStatus(setDir, root) {
  const setName = path.basename(setDir);
  const reportPath = path.join(root, "reports", `verify-${setName}.json`);
  if (!fs.existsSync(reportPath)) {
    return false;
  }
  try {
    let text = fs.readFileSync(reportPath, "utf8");
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }
    const j = JSON.parse(text);
    if (j.status !== "PASS") return false;
    if (j.backupSetFinalized !== true) return false;
    if (
      j.backupSetFolder !== undefined &&
      String(j.backupSetFolder) !== setName
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function runRetention(root, apply) {
  let ROOT;
  let backupsDir;
  try {
    ({ ROOT, backupsDir } = validateRetentionRoot(root));
  } catch (err) {
    console.error(String(err.message || err));
    return 12;
  }
  const WEEKLY_KEEP = Number(process.env.HB_WEEKLY_KEEP || 8);
  const MONTHLY_KEEP = Number(process.env.HB_MONTHLY_KEEP || 12);

  if (!fs.existsSync(backupsDir)) {
    process.stdout.write(
      JSON.stringify({ action: "none", reason: "no backups dir" }) + "\n",
    );
    return 0;
  }

  const sets = fs
    .readdirSync(backupsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => name !== "_staging")
    .sort();

  const verified = sets.filter((name) =>
    readVerifyStatus(path.join(backupsDir, name), ROOT),
  );
  if (verified.length === 0) {
    process.stdout.write(
      JSON.stringify({
        action: "none",
        reason: "no verified sets — retention skipped",
        deleteCandidates: [],
      }) + "\n",
    );
    return 0;
  }

  const newestVerified = verified[verified.length - 1];
  const lastKnownGood = verified[verified.length - 1];

  const protectedSet = new Set([newestVerified, lastKnownGood]);

  const verifiedByTime = verified.map((name) => ({
    name,
    dir: path.join(backupsDir, name),
    month: name.slice(0, 7),
  }));

  const monthlyWinners = new Map();
  for (const row of verifiedByTime) {
    if (!monthlyWinners.has(row.month)) monthlyWinners.set(row.month, row.name);
  }

  const monthlyKeep = [...monthlyWinners.values()].sort().slice(-MONTHLY_KEEP);

  const weeklyKeep = verified.slice(-WEEKLY_KEEP);

  const keep = new Set([...protectedSet, ...monthlyKeep, ...weeklyKeep]);

  const deleteCandidates = sets.filter(
    (name) =>
      !keep.has(name) &&
      readVerifyStatus(path.join(backupsDir, name), ROOT),
  );

  const plan = {
    newestVerified,
    weeklyKeepCount: weeklyKeep.length,
    monthlyKeepCount: monthlyKeep.length,
    protected: [...protectedSet],
    deleteCandidates,
    apply,
  };

  if (apply && deleteCandidates.length > 0) {
    for (const name of deleteCandidates) {
      const target = resolveBackupSetDir(backupsDir, name);
      if (!fs.existsSync(target)) continue;
      fs.rmSync(target, { recursive: true, force: true });
    }
  }

  process.stdout.write(JSON.stringify(plan, null, 2) + "\n");
  return 0;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const ROOT = process.argv[2] || "";
  const APPLY = process.argv.includes("--apply");
  if (!ROOT) {
    console.error("usage: retention.mjs <backupRoot> [--apply]");
    process.exit(2);
  }
  process.exit(runRetention(ROOT, APPLY));
}
