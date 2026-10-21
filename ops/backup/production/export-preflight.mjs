#!/usr/bin/env node
/**
 * Pre-export checks for create-pull-bundle.sh (no dumps, no secrets in output).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveExportApproval } from "./export-approval.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_COMMANDS = [
  "pg_dump",
  "pg_restore",
  "psql",
  "node",
  "tar",
  "sha256sum",
  "age",
  "flock",
];

const DEFAULT_MIN_FREE_BYTES = 2 * 1024 * 1024 * 1024;

/**
 * @param {string} dir
 */
export function isPathInsideGitCheckout(dir) {
  let current = path.resolve(dir);
  for (let i = 0; i < 32; i++) {
    if (fs.existsSync(path.join(current, ".git"))) {
      return true;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return false;
}

/**
 * @param {string} outputParent
 * @param {string} appRoot
 */
export function isUnsafeBackupDestination(outputParent, appRoot) {
  const resolved = path.resolve(outputParent);
  const app = path.resolve(appRoot);
  const lower = resolved.toLowerCase();
  const publicMarkers = [
    `${path.sep}public${path.sep}`,
    `${path.sep}public_html${path.sep}`,
    `${path.sep}www${path.sep}`,
    `${path.sep}sites-enabled${path.sep}`,
  ];
  for (const marker of publicMarkers) {
    if (lower.includes(marker.replace(/\\/g, "/"))) {
      return "public_web_path";
    }
  }
  if (resolved === app || resolved.startsWith(app + path.sep)) {
    return "inside_app_root";
  }
  if (isPathInsideGitCheckout(resolved)) {
    return "inside_git_checkout";
  }
  return null;
}

/**
 * @param {string} cmd
 */
export function commandExists(cmd) {
  const r = spawnSync("sh", ["-c", `command -v ${cmd}`], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return r.status === 0;
}

/**
 * @param {string} dir
 * @param {number} minBytes
 */
export function hasSufficientDiskSpace(dir, minBytes) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const st = fs.statfsSync(dir);
    const free = Number(st.bfree) * Number(st.bsize);
    return free >= minBytes;
  } catch {
    return false;
  }
}

/**
 * @param {string} recipientFile
 */
export function recipientFileLooksValid(recipientFile) {
  if (!fs.existsSync(recipientFile)) {
    return false;
  }
  const text = fs.readFileSync(recipientFile, "utf8");
  return /^age1[A-Za-z0-9]+$/m.test(text);
}

/**
 * @param {string} envFile
 * @param {{ skipDatabasePing?: boolean }} opts
 */
export function pingDatabase(envFile, opts = {}) {
  if (opts.skipDatabasePing) {
    return { ok: true, skipped: true };
  }
  const runPg = path.join(SCRIPT_DIR, "run-with-pg-env.mjs");
  const r = spawnSync(
    "node",
    [runPg, "--env-file", envFile, "--", "psql", "-v", "ON_ERROR_STOP=1", "-tAc", "SELECT 1"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30_000,
    },
  );
  if (r.status !== 0) {
    return { ok: false };
  }
  return { ok: String(r.stdout || "").trim() === "1" };
}

/**
 * @param {{
 *   envFilePath: string;
 *   appRoot: string;
 *   outputParent: string;
 *   recipientFile?: string;
 *   minFreeBytes?: number;
 *   allowProcessEnvApproval?: boolean;
 *   skipDatabasePing?: boolean;
 * }} opts
 */
export function runExportPreflight(opts) {
  const approval = resolveExportApproval({
    envFilePath: opts.envFilePath,
    allowProcessEnvOverride: Boolean(opts.allowProcessEnvApproval),
  });
  if (!approval.ok) {
    return { ok: false, stage: "approval", code: 11, detail: approval.reason };
  }

  for (const cmd of REQUIRED_COMMANDS) {
    if (!commandExists(cmd)) {
      return { ok: false, stage: "commands", code: 20, detail: cmd };
    }
  }

  const recipientFile =
    opts.recipientFile ||
    path.join(process.env.HOME || "", ".config/hostingbeyond-backup/age-recipient.txt");
  if (!recipientFileLooksValid(recipientFile)) {
    return { ok: false, stage: "encryption_recipient", code: 21, detail: "missing_or_invalid" };
  }

  const destIssue = isUnsafeBackupDestination(opts.outputParent, opts.appRoot);
  if (destIssue) {
    return { ok: false, stage: "destination", code: 22, detail: destIssue };
  }

  const minFree = opts.minFreeBytes ?? DEFAULT_MIN_FREE_BYTES;
  if (!hasSufficientDiskSpace(opts.outputParent, minFree)) {
    return { ok: false, stage: "disk_space", code: 23, detail: "insufficient" };
  }

  const db = pingDatabase(opts.envFilePath, {
    skipDatabasePing: opts.skipDatabasePing,
  });
  if (!db.ok) {
    return { ok: false, stage: "database_connectivity", code: 24, detail: "unreachable" };
  }

  return { ok: true, stage: "complete", code: 0 };
}

function main() {
  const args = process.argv.slice(2);
  let envFile = "";
  let appRoot = "/srv/apps/hostingbeyond";
  let outputParent = "";
  let skipDb = false;
  let allowProcess = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--env-file") envFile = args[++i] || "";
    else if (a === "--app-root") appRoot = args[++i] || appRoot;
    else if (a === "--output-parent") outputParent = args[++i] || "";
    else if (a === "--skip-database-ping") skipDb = true;
    else if (a === "--allow-process-env-approval") allowProcess = true;
    else if (a === "-h" || a === "--help") {
      console.log("export-preflight.mjs --env-file <path> [--app-root <path>] [--output-parent <dir>]");
      process.exit(0);
    }
  }

  if (!envFile) {
    console.error("export-preflight: missing --env-file");
    process.exit(2);
  }
  if (!outputParent) {
    outputParent = path.join(process.env.HOME || "/tmp", "backup-export");
  }

  const result = runExportPreflight({
    envFilePath: envFile,
    appRoot,
    outputParent,
    allowProcessEnvApproval: allowProcess,
    skipDatabasePing: skipDb,
  });

  if (!result.ok) {
    console.error(`export-preflight: FAIL stage=${result.stage} code=${result.code}`);
    process.exit(result.code);
  }
  console.log("export-preflight: PASS");
  process.exit(0);
}

const isMain =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  main();
}
