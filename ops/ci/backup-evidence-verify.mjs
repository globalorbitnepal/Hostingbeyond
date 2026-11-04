/**
 * Fail-closed backup-evidence check for the production migrate gate.
 * A GitHub secret, migrate-approval flag, or missing file is never "verified".
 * Does not print file contents or secrets.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Ciphertext SHA-256 of the restorable 2026-11-04_15-30-20 production bundle. */
export const REQUIRED_AGE_SHA256 =
  "a17a560d43353616d78c06f78d0b150d86b840cdc984ae3a6726919bc176a7bc";
export const LAB_HOST = "127.0.0.1";
export const LAB_PORT = 55433;
export const LAB_DATABASE = "hostingbeyond_restore_test";
export const DEFAULT_AGE_PATH =
  "/home/hostingbeyond/backup-export/LATEST.bundle.tar.age";
export const DEFAULT_RESTORE_REPORT_PATH =
  "/home/hostingbeyond/backup-export/LATEST.restore-report.json";

function sha256File(path) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(path));
  return hash.digest("hex");
}

function fail(reason, detail = {}) {
  return { ok: false, evidence: "absent", reason, ...detail };
}

/**
 * @param {{
 *   agePath?: string,
 *   restoreReportPath?: string,
 *   expectedAgeSha256?: string,
 *   migrateApproved?: boolean,
 *   repairApproved?: boolean,
 * }} input
 */
export function assessBackupEvidence(input = {}) {
  const expected = String(input.expectedAgeSha256 || REQUIRED_AGE_SHA256);
  const agePath = String(input.agePath || "").trim();
  const restoreReportPath = String(input.restoreReportPath || "").trim();
  const filesPresent =
    Boolean(agePath) &&
    Boolean(restoreReportPath) &&
    fs.existsSync(agePath) &&
    fs.existsSync(restoreReportPath);
  if ((input.migrateApproved || input.repairApproved) && !filesPresent) {
    return fail("SECRET_IS_NOT_BACKUP_EVIDENCE");
  }
  if (!agePath || !restoreReportPath) {
    return fail("EVIDENCE_PATHS_MISSING");
  }

  if (!fs.existsSync(agePath) || !fs.statSync(agePath).isFile()) {
    return fail("AGE_CIPHERTEXT_MISSING");
  }
  const ageSha = sha256File(agePath);
  if (ageSha !== expected) {
    return fail("AGE_SHA256_MISMATCH");
  }

  if (!fs.existsSync(restoreReportPath) || !fs.statSync(restoreReportPath).isFile()) {
    return fail("RESTORE_REPORT_MISSING");
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(restoreReportPath, "utf8"));
  } catch {
    return fail("RESTORE_REPORT_UNPARSEABLE");
  }

  if (report.status !== "PASS") return fail("RESTORE_DRILL_NOT_PASS");
  if (report.host !== LAB_HOST) return fail("RESTORE_HOST_REJECTED");
  if (Number(report.port) !== LAB_PORT) return fail("RESTORE_PORT_REJECTED");
  if (report.database !== LAB_DATABASE) return fail("RESTORE_DATABASE_REJECTED");
  if (!Number.isInteger(report.migrationRows) || report.migrationRows < 1) {
    return fail("RESTORE_MIGRATIONS_MISSING");
  }
  if (report.restoredArtifactSha256 !== expected) {
    return fail("RESTORE_ARTIFACT_NOT_PRODUCTION_BUNDLE");
  }

  return {
    ok: true,
    evidence: "verified",
    reason: "BACKUP_EVIDENCE_VERIFIED",
    ageSha256: ageSha,
  };
}

export function backupEvidenceCliFlag(assessment) {
  return assessment.ok && assessment.evidence === "verified" ? "verified" : "absent";
}

export function assessBackupEvidenceFromEnv(
  env = process.env,
) {
  return assessBackupEvidence({
    agePath: env.HB_BACKUP_AGE_PATH || DEFAULT_AGE_PATH,
    restoreReportPath: env.HB_BACKUP_RESTORE_REPORT || DEFAULT_RESTORE_REPORT_PATH,
    expectedAgeSha256: env.HB_BACKUP_AGE_SHA256,
    migrateApproved: env.HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED === "true",
    repairApproved:
      env.HOSTINGBEYOND_BEYOND_AI_HISTORY_REPAIR_APPROVED === "true",
  });
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const assessment = assessBackupEvidenceFromEnv();
  const flag = backupEvidenceCliFlag(assessment);
  if (process.argv.includes("--print-flag")) {
    process.stdout.write(`${flag}\n`);
  } else {
    process.stdout.write(
      `BACKUP_EVIDENCE=${flag}\nBACKUP_EVIDENCE_REASON=${assessment.reason}\n`,
    );
  }
  process.exit(0);
}
