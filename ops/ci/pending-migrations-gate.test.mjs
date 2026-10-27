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

  it("runs migrate then allows code deploy when approved and pending", () => {
    const d = decideDeployAfterMigrateStatus({
      migrateApproved: true,
      statusExitCode: 1,
      statusText: PENDING_STATUS,
    });
    assert.equal(d.action, "migrate");
    assert.equal(d.reason, "MIGRATE_THEN_DEPLOY");
    assert.equal(d.runMigrate, true);
    assert.equal(d.allowCodeDeploy, true);
    assert.equal(d.exitCode, 0);
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
