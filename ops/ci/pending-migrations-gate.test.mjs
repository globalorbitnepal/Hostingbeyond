import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  decideDeployAfterMigrateStatus,
  parsePrismaMigrateStatus,
} from "./pending-migrations-gate.mjs";

const PENDING_STATUS = `Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "hostingbeyond_db" at "127.0.0.1:5432"

21 migrations found in prisma/migrations

Following migrations have not yet been applied:
20261025120000_namesilo_pricing_provider
20261025130000_transfer_registrar_wallet

To apply migrations in production run prisma migrate deploy.
`;

const UP_TO_DATE = `Prisma schema loaded from prisma/schema.prisma
Database schema is up to date!
`;

const FAILED_BEYOND_AI = `Prisma schema loaded from prisma/schema.prisma
25 migrations found in prisma/migrations

Following migration has failed:
20260913120000_beyond_ai

During development you can reset the database.
`;

describe("parsePrismaMigrateStatus", () => {
  it("extracts pending migration names", () => {
    const parsed = parsePrismaMigrateStatus(PENDING_STATUS);
    assert.deepEqual(parsed.pendingNames, [
      "20261025120000_namesilo_pricing_provider",
      "20261025130000_transfer_registrar_wallet",
    ]);
    assert.equal(parsed.upToDate, false);
  });

  it("detects up-to-date schema", () => {
    const parsed = parsePrismaMigrateStatus(UP_TO_DATE);
    assert.equal(parsed.upToDate, true);
    assert.deepEqual(parsed.pendingNames, []);
  });
});

describe("decideDeployAfterMigrateStatus", () => {
  it("blocks code deploy when migrations are pending and approval is missing", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: false,
      statusExitCode: 1,
      statusText: PENDING_STATUS,
    });
    assert.equal(d.action, "block");
    assert.equal(d.reason, "PENDING_MIGRATIONS_REQUIRE_APPROVAL");
    assert.equal(d.allowCodeDeploy, false);
    assert.equal(d.runMigrate, false);
    assert.equal(d.exitCode, 1);
  });

  it("runs migrate then allows code deploy when approved, pending, and backup evidence is verified", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      repairApproved: false,
      backupEvidence: "verified",
      statusExitCode: 1,
      statusText: PENDING_STATUS,
    });
    assert.equal(d.action, "migrate");
    assert.equal(d.reason, "MIGRATE_THEN_DEPLOY");
    assert.equal(d.runMigrate, true);
    assert.equal(d.runBeyondAiRepair, false);
    assert.equal(d.allowCodeDeploy, true);
    assert.equal(d.exitCode, 0);
  });

  it("does not repair beyond_ai when only normal migration approval is set", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      repairApproved: false,
      backupEvidence: "verified",
      statusExitCode: 1,
      statusText: FAILED_BEYOND_AI,
    });
    assert.equal(d.runBeyondAiRepair, false);
    assert.equal(d.action, "block");
    assert.equal(d.reason, "MIGRATE_FAILED_HISTORY");
    assert.equal(d.allowCodeDeploy, false);
  });

  it("requires a separate approval before the old beyond_ai repair", () => {
    const without = decideDeployAfterMigrateStatus({
      migrateApproved: false,
      repairApproved: false,
      backupEvidence: "verified",
      statusExitCode: 1,
      statusText: FAILED_BEYOND_AI,
    });
    assert.equal(without.runBeyondAiRepair, false);
    const withRepair = decideDeployAfterMigrateStatus({
      migrateApproved: false,
      repairApproved: true,
      backupEvidence: "verified",
      statusExitCode: 1,
      statusText: FAILED_BEYOND_AI,
    });
    assert.equal(withRepair.action, "repair");
    assert.equal(withRepair.runBeyondAiRepair, true);
    assert.equal(withRepair.runMigrate, false);
    assert.equal(withRepair.allowCodeDeploy, false);
  });

  it("blocks normal deployment when migration history has a failure", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      backupEvidence: "verified",
      statusExitCode: 1,
      statusText: FAILED_BEYOND_AI,
    });
    assert.equal(d.reason, "MIGRATE_FAILED_HISTORY");
    assert.equal(d.exitCode, 1);
    assert.equal(d.allowCodeDeploy, false);
  });

  it("fails closed when repair is approved but the migration state is unknown", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: false,
      repairApproved: true,
      backupEvidence: "verified",
      statusExitCode: 1,
      statusText: "Could not connect to database",
    });
    assert.equal(d.action, "block");
    assert.equal(d.reason, "REPAIR_STATE_UNKNOWN");
    assert.equal(d.runBeyondAiRepair, false);
  });

  it("blocks production migration when backup evidence is missing", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      repairApproved: false,
      backupEvidence: "absent",
      statusExitCode: 1,
      statusText: PENDING_STATUS,
    });
    assert.equal(d.action, "block");
    assert.equal(d.reason, "BACKUP_EVIDENCE_REQUIRED");
    assert.equal(d.runMigrate, false);
    assert.equal(d.allowCodeDeploy, false);
  });

  it("rejects both approvals together and does not restart after a migration block", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      repairApproved: true,
      backupEvidence: "verified",
      statusExitCode: 1,
      statusText: PENDING_STATUS,
    });
    assert.equal(d.reason, "REPAIR_AND_MIGRATE_BOTH_APPROVED");
    assert.equal(d.runMigrate, false);
    assert.equal(d.runBeyondAiRepair, false);
    assert.equal(d.allowCodeDeploy, false);
    assert.equal(d.exitCode, 1);
  });

  it("allows code deploy without migrate when schema is up to date", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: false,
      statusExitCode: 0,
      statusText: UP_TO_DATE,
    });
    assert.equal(d.action, "continue");
    assert.equal(d.runMigrate, false);
    assert.equal(d.allowCodeDeploy, true);
  });

  it("blocks unparseable migrate status", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      statusExitCode: 1,
      statusText: "Could not connect to database",
    });
    assert.equal(d.action, "block");
    assert.equal(d.reason, "MIGRATE_STATUS_UNPARSEABLE");
  });

  it("blocks drift even if migrate is approved", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      statusExitCode: 1,
      statusText: "Drift detected: Your database schema is not in sync.",
    });
    assert.equal(d.action, "block");
    assert.equal(d.reason, "MIGRATE_DRIFT");
  });
});
