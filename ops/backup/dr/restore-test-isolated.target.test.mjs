import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import {
  LAB_DATABASE,
  LAB_HOST,
  LAB_PORT,
  LAB_ROLE,
  REQUIRED_TABLES,
  assessSchema,
  assessServerIdentity,
  resolveRestoreConfig,
  scrubChildEnv,
} from "./restore-test-isolated.mjs";

const SCRIPT = path.join(
  path.resolve(new URL(".", import.meta.url).pathname),
  "restore-test-isolated.mjs",
);
const MISSING_DUMP = "/nonexistent/hostingbeyond-restore-target.dump";

function labEnv(extra = {}) {
  return {
    PGHOST: LAB_HOST,
    PGPORT: String(LAB_PORT),
    PGDATABASE: LAB_DATABASE,
    PGUSER: LAB_ROLE,
    PGPASSWORD: "restore-test-only",
    ...extra,
  };
}

function run(envExtra = {}, database = LAB_DATABASE) {
  return spawnSync(process.execPath, [SCRIPT, MISSING_DUMP, database], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "/tmp",
      ...labEnv(),
      ...envExtra,
    },
  });
}

const identity = {
  currentDatabase: LAB_DATABASE,
  serverAddr: LAB_HOST,
  serverPort: LAB_PORT,
};

describe("restore target configuration", () => {
  it("accepts the dedicated loopback restore target", () => {
    assert.deepEqual(resolveRestoreConfig(labEnv()), {
      ok: true,
      host: LAB_HOST,
      port: 55433,
      database: LAB_DATABASE,
      role: LAB_ROLE,
    });
  });

  it("rejects port 5432, port 55432, and a remote host", () => {
    assert.equal(resolveRestoreConfig(labEnv({ PGPORT: "5432" })).exitCode, 9);
    assert.equal(resolveRestoreConfig(labEnv({ PGPORT: "55432" })).exitCode, 9);
    assert.equal(resolveRestoreConfig(labEnv({ PGHOST: "203.0.113.10" })).exitCode, 8);
    assert.equal(resolveRestoreConfig(labEnv({ PGHOST: "localhost" })).exitCode, 8);
  });

  it("rejects production and staging database names", () => {
    assert.equal(run({}, "hostingbeyond_db").status, 3);
    assert.equal(run({}, "hostingbeyond_integration_test").status, 3);
    assert.equal(
      resolveRestoreConfig(labEnv({ PGDATABASE: "hostingbeyond_db" })).exitCode,
      9,
    );
    assert.equal(
      resolveRestoreConfig(labEnv({ PGDATABASE: "hostingbeyond_integration_test" })).exitCode,
      9,
    );
  });

  it("rejects the production role and missing credentials", () => {
    assert.equal(
      resolveRestoreConfig(labEnv({ PGUSER: "hostingbeyond_user" })).exitCode,
      9,
    );
    assert.equal(resolveRestoreConfig(labEnv({ PGUSER: "" })).exitCode, 9);
    assert.equal(resolveRestoreConfig(labEnv({ PGPASSWORD: "" })).exitCode, 9);
    const missing = run({ PGPASSWORD: "" });
    assert.equal(missing.status, 9);
    assert.match(missing.stderr, /credentials missing/);
  });

  it("fails closed when the connected server identity is not the restore instance", () => {
    assert.equal(assessServerIdentity(identity).ok, true);
    assert.equal(assessServerIdentity({ ...identity, serverPort: 5432 }).ok, false);
    assert.equal(assessServerIdentity({ ...identity, serverPort: 55432 }).ok, false);
    assert.equal(
      assessServerIdentity({ ...identity, currentDatabase: "hostingbeyond_db" }).ok,
      false,
    );
    assert.equal(
      assessServerIdentity({ ...identity, serverAddr: "10.0.0.8" }).ok,
      false,
    );
  });

  it("requires migration records and application tables without customer rows", () => {
    assert.equal(
      assessSchema({ migrationRows: 4, tables: REQUIRED_TABLES }).ok,
      true,
    );
    assert.equal(assessSchema({ migrationRows: 0, tables: REQUIRED_TABLES }).ok, false);
    assert.equal(
      assessSchema({ migrationRows: 4, tables: ["CustomerUser"] }).ok,
      false,
    );
    assert.equal(
      assessSchema({
        migrationRows: 4,
        tables: REQUIRED_TABLES,
        customerRows: [{ email: "hidden" }],
      }).ok,
      false,
    );
  });

  it("does not pass application credentials or redirect traffic", () => {
    const child = scrubChildEnv(
      {
        DATABASE_URL: "postgresql://hostingbeyond_user:secret@127.0.0.1:5432/hostingbeyond_db",
        PGHOST: "203.0.113.10",
        PGPORT: "5432",
        PGUSER: "hostingbeyond_user",
      },
      { host: LAB_HOST, port: LAB_PORT, database: LAB_DATABASE, role: LAB_ROLE },
    );
    assert.equal(child.DATABASE_URL, undefined);
    assert.equal(child.PGHOST, "127.0.0.1");
    assert.equal(child.PGPORT, "55433");
    assert.equal(child.PGUSER, LAB_ROLE);
    assert.equal(child.PGDATABASE, LAB_DATABASE);
  });
});
