/**
 * Decide whether production code deploy may continue given prisma migrate status.
 * Does not connect to a database; callers pass status text from `prisma migrate status`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATION_NAME = /^(\d{14}_[A-Za-z0-9_]+)$/;
export const BEYOND_AI_MIGRATION = "20260913120000_beyond_ai";

export const BACKUP_EVIDENCE_LINES = [
  "BACKUP_EVIDENCE_REQUIRED: prisma migrate deploy will not run.",
  "This workflow cannot verify a restore record automatically.",
  "An environment flag is not backup evidence.",
  "Required manual evidence:",
  "1. Timestamp of a PostgreSQL custom-format dump.",
  "2. Encrypted age ciphertext and its off-site location.",
  "3. Restore drill PASS into an isolated database that is not the production server.",
];

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
function namesAfter(raw, headerRe) {
  const header = raw.search(headerRe);
  if (header < 0) return [];
  const names = [];
  const after = raw.slice(header).split(/\r?\n/).slice(1);
  for (const line of after) {
    const trimmed = line.trim().replace(/^[`-]+|[`-]+$/g, "");
    if (!trimmed) break;
    if (/^to apply migrations/i.test(trimmed) || /^during /i.test(trimmed)) break;
    const match = trimmed.match(MIGRATION_NAME);
    if (!match) break;
    names.push(match[1]);
  }
  return names;
}

export function parsePrismaMigrateStatus(text) {
  const raw = String(text || "");
  const drift =
    /drift detected/i.test(raw) ||
    /applied to the database but missing from the local migrations directory/i.test(
      raw,
    );
  const upToDate = /database schema is up to date/i.test(raw);
  const pendingNames = namesAfter(raw, /have not yet been applied:?/i);
  const failedNames = [
    ...new Set([
      ...namesAfter(raw, /following migrations? ha(?:s|ve) failed:?/i),
      ...[...raw.matchAll(/migration [`'](\d{14}_[A-Za-z0-9_]+)[`'] failed/gi)].map(
        (match) => match[1],
      ),
    ]),
  ];
  const failedMention =
    /migration.*failed/i.test(raw) || /\bfailed to apply\b/i.test(raw);
  const failedUnknown = failedMention && failedNames.length === 0;
  const failed = failedNames.length > 0 || failedUnknown;
  const foundMatch = raw.match(/(\d+) migrations found/i);
  const migrationsFound = foundMatch ? Number(foundMatch[1]) : null;
  const parseable =
    upToDate || pendingNames.length > 0 || failedNames.length > 0 || drift || failedUnknown;
  return {
    upToDate,
    pendingNames,
    failedNames,
    failedUnknown,
    drift,
    failed,
    migrationsFound,
    parseable,
  };
}

export function classifyBeyondAiHistory(parsed) {
  if (!parsed.parseable) return "unknown";
  if (parsed.failedUnknown) return "unknown";
  if (parsed.failedNames.includes(BEYOND_AI_MIGRATION)) return "failed";
  if (parsed.pendingNames.includes(BEYOND_AI_MIGRATION)) return "pending";
  if (parsed.upToDate) return "finished_schema_up_to_date";
  return "not_listed";
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
  const repairApproved = Boolean(input.repairApproved);
  const backupVerified = input.backupEvidence === "verified";
  const parsed = parsePrismaMigrateStatus(input.statusText);
  const statusExit = Number(input.statusExitCode);
  const beyondAiHistory = classifyBeyondAiHistory(parsed);
  const base = {
    pendingNames: parsed.pendingNames,
    failedNames: parsed.failedNames,
    migrationsFound: parsed.migrationsFound,
    beyondAiHistory,
    repairApproved,
    backupEvidence: backupVerified ? "verified" : "absent",
    runBeyondAiRepair: false,
  };

  if (repairApproved && approved) {
    return block("REPAIR_AND_MIGRATE_BOTH_APPROVED", base);
  }
  if (parsed.drift) {
    return block("MIGRATE_DRIFT", base);
  }
  if (!parsed.parseable || parsed.failedUnknown) {
    return block(repairApproved ? "REPAIR_STATE_UNKNOWN" : "MIGRATE_STATUS_UNPARSEABLE", base);
  }
  if (!Number.isInteger(statusExit) || statusExit < 0) {
    return block("MIGRATE_STATUS_FAIL", base);
  }
  if (statusExit !== 0 && parsed.pendingNames.length === 0 && parsed.failedNames.length === 0 && !parsed.upToDate) {
    return block("MIGRATE_STATUS_FAIL", base);
  }

  if (repairApproved) {
    const onlyBeyondAi =
      parsed.failedNames.length === 1 && parsed.failedNames[0] === BEYOND_AI_MIGRATION;
    if (!onlyBeyondAi || beyondAiHistory !== "failed") {
      return block("REPAIR_STATE_AMBIGUOUS", base);
    }
    if (!backupVerified) {
      return block("BACKUP_EVIDENCE_REQUIRED", base);
    }
    return {
      ...base,
      action: "repair",
      reason: "BEYOND_AI_REPAIR_ONLY",
      runMigrate: false,
      runBeyondAiRepair: true,
      allowCodeDeploy: false,
      exitCode: 1,
    };
  }

  if (parsed.failed) {
    return block("MIGRATE_FAILED_HISTORY", base);
  }

  if (parsed.pendingNames.length > 0) {
    if (!approved) {
      return block("PENDING_MIGRATIONS_REQUIRE_APPROVAL", base);
    }
    if (!backupVerified) {
      return block("BACKUP_EVIDENCE_REQUIRED", base);
    }
    return {
      ...base,
      action: "migrate",
      reason: "MIGRATE_THEN_DEPLOY",
      runMigrate: true,
      allowCodeDeploy: true,
      exitCode: 0,
    };
  }

  return {
    ...base,
    action: "continue",
    reason: parsed.upToDate ? "SCHEMA_UP_TO_DATE" : "NO_PENDING_MIGRATIONS",
    runMigrate: false,
    allowCodeDeploy: true,
    exitCode: 0,
  };
}

function block(reason, base) {
  return {
    ...base,
    action: "block",
    reason,
    runMigrate: false,
    runBeyondAiRepair: false,
    allowCodeDeploy: false,
    exitCode: 1,
  };
}

export function formatGateOutput(decision) {
  const finished =
    Number.isInteger(decision.migrationsFound) &&
    decision.beyondAiHistory !== "unknown"
      ? String(
          decision.migrationsFound -
            decision.pendingNames.length -
            decision.failedNames.length,
        )
      : "unknown";
  const repairRequired =
    decision.beyondAiHistory === "failed"
      ? "yes"
      : decision.beyondAiHistory === "unknown"
        ? "unknown"
        : "no";
  const lines = [
    `GATE_ACTION=${decision.action}`,
    `GATE_REASON=${decision.reason}`,
    `PENDING_COUNT=${decision.pendingNames.length}`,
    `PENDING_MIGRATIONS=${decision.pendingNames.join(",") || "none"}`,
    `FAILED_MIGRATIONS=${decision.failedNames.join(",") || "none"}`,
    `MIGRATIONS_FOUND=${decision.migrationsFound ?? "unknown"}`,
    `FINISHED_COUNT=${finished}`,
    `BEYOND_AI_HISTORY=${decision.beyondAiHistory}`,
    `BEYOND_AI_REPAIR_REQUIRED=${repairRequired}`,
    `BEYOND_AI_REPAIR_APPROVED=${decision.repairApproved ? "yes" : "no"}`,
    `RUN_BEYOND_AI_REPAIR=${decision.runBeyondAiRepair ? "1" : "0"}`,
    `BACKUP_EVIDENCE=${decision.backupEvidence}`,
    "NO_SCHEMA_ROLLBACK=true",
  ];
  if (decision.reason === "BACKUP_EVIDENCE_REQUIRED") {
    lines.push(...BACKUP_EVIDENCE_LINES);
  }
  return lines.join("\n");
}

function main(argv) {
  let approvedRaw = "0";
  let repairRaw = "0";
  let backupEvidence = "absent";
  let statusExit = 0;
  let statusText = "";
  let statusFile = "";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--approved") approvedRaw = String(argv[++i] ?? "");
    else if (arg === "--repair-approved") repairRaw = String(argv[++i] ?? "");
    else if (arg === "--backup-evidence") backupEvidence = String(argv[++i] ?? "");
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
  const repairApproved = repairRaw === "1" || repairRaw.toLowerCase() === "true";
  const decision = decideDeployAfterMigrateStatus({
    migrateApproved,
    repairApproved,
    backupEvidence: backupEvidence === "verified" ? "verified" : "absent",
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
