/**
 * Decide whether production code deploy may continue given prisma migrate status.
 * Does not connect to a database; callers pass status text from `prisma migrate status`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATION_NAME = /^(\d{14}_[A-Za-z0-9_]+)$/;

/**
 * @param {string} text
 * @returns {{
 *   upToDate: boolean,
 *   pendingNames: string[],
 *   drift: boolean,
 *   failed: boolean,
 *   parseable: boolean,
 * }}
 */
export function parsePrismaMigrateStatus(text) {
  const raw = String(text || "");
  const drift =
    /drift detected/i.test(raw) ||
    /applied to the database but missing from the local migrations directory/i.test(
      raw,
    );
  const failed = /migration.*failed/i.test(raw) || /\bfailed to apply\b/i.test(raw);
  const upToDate = /database schema is up to date/i.test(raw);
  const pendingNames = [];
  const pendingHeader = raw.search(/have not yet been applied:?/i);
  if (pendingHeader >= 0) {
    const after = raw.slice(pendingHeader).split(/\r?\n/).slice(1);
    for (const line of after) {
      const trimmed = line.trim();
      if (!trimmed) break;
      if (/^to apply migrations/i.test(trimmed)) break;
      const match = trimmed.match(MIGRATION_NAME);
      if (match) pendingNames.push(match[1]);
    }
  }
  const parseable = upToDate || pendingNames.length > 0 || drift || failed;
  return { upToDate, pendingNames, drift, failed, parseable };
}

/**
 * @param {{
 *   migrateApproved: boolean,
 *   statusExitCode: number,
 *   statusText: string,
 * }} input
 * @returns {{
 *   action: "continue" | "migrate" | "block",
 *   reason: string,
 *   pendingNames: string[],
 *   runMigrate: boolean,
 *   allowCodeDeploy: boolean,
 *   exitCode: number,
 * }}
 */
export function decideDeployAfterMigrateStatus(input) {
  const approved = Boolean(input.migrateApproved);
  const parsed = parsePrismaMigrateStatus(input.statusText);
  const statusExit = Number(input.statusExitCode);

  if (parsed.drift) {
    return block("MIGRATE_DRIFT", parsed.pendingNames);
  }
  if (parsed.failed) {
    return block("MIGRATE_FAILED_HISTORY", parsed.pendingNames);
  }
  if (!parsed.parseable) {
    return block("MIGRATE_STATUS_UNPARSEABLE", []);
  }
  if (!Number.isInteger(statusExit) || statusExit < 0) {
    return block("MIGRATE_STATUS_FAIL", parsed.pendingNames);
  }
  if (statusExit !== 0 && parsed.pendingNames.length === 0 && !parsed.upToDate) {
    return block("MIGRATE_STATUS_FAIL", parsed.pendingNames);
  }

  if (parsed.pendingNames.length > 0) {
    if (!approved) {
      return block("PENDING_MIGRATIONS_REQUIRE_APPROVAL", parsed.pendingNames);
    }
    return {
      action: "migrate",
      reason: "MIGRATE_THEN_DEPLOY",
      pendingNames: parsed.pendingNames,
      runMigrate: true,
      allowCodeDeploy: true,
      exitCode: 0,
    };
  }

  return {
    action: "continue",
    reason: parsed.upToDate ? "SCHEMA_UP_TO_DATE" : "NO_PENDING_MIGRATIONS",
    pendingNames: [],
    runMigrate: false,
    allowCodeDeploy: true,
    exitCode: 0,
  };
}

function block(reason, pendingNames) {
  return {
    action: "block",
    reason,
    pendingNames,
    runMigrate: false,
    allowCodeDeploy: false,
    exitCode: 1,
  };
}

export function formatGateOutput(decision) {
  return [
    `GATE_ACTION=${decision.action}`,
    `GATE_REASON=${decision.reason}`,
    `PENDING_COUNT=${decision.pendingNames.length}`,
    "NO_SCHEMA_ROLLBACK=true",
  ].join("\n");
}

function main(argv) {
  let approvedRaw = "0";
  let statusExit = 0;
  let statusText = "";
  let statusFile = "";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--approved") approvedRaw = String(argv[++i] ?? "");
    else if (arg === "--status-exit") statusExit = Number(argv[++i]);
    else if (arg === "--status-file") statusFile = String(argv[++i] ?? "");
  }
  if (statusFile) {
    statusText = fs.readFileSync(statusFile, "utf8");
  } else if (!process.stdin.isTTY) {
    statusText = fs.readFileSync(0, "utf8");
  }
  const migrateApproved =
    approvedRaw === "1" || approvedRaw.toLowerCase() === "true";
  const decision = decideDeployAfterMigrateStatus({
    migrateApproved,
    statusExitCode: Number.isFinite(statusExit) ? statusExit : -1,
    statusText,
  });
  process.stdout.write(`${formatGateOutput(decision)}\n`);
  if (decision.action === "block") {
    process.stderr.write(`pending-migrations-gate: ${decision.reason}\n`);
  }
  process.exit(decision.exitCode);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main(process.argv.slice(2));
}
