import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { LAB_PORT, resolveLabPort } from "./restore-test-isolated.mjs";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const SCRIPT = path.join(ROOT, "ops/backup/dr/restore-test-isolated.mjs");
const LAB = "hostingbeyond_restore_test";
const MISSING_DUMP = "/nonexistent/hostingbeyond-restore-test.dump";

function labEnv(extra = {}) {
  return {
    PGHOST: "127.0.0.1",
    PGPORT: "55433",
    PGDATABASE: LAB,
    PGUSER: "hostingbeyond_restore_test_owner",
    PGPASSWORD: "restore-test-only",
    ...extra,
  };
}

function run(envExtra = {}) {
  const env = { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "/tmp" };
  return spawnSync("node", [SCRIPT, MISSING_DUMP, LAB], {
    encoding: "utf8",
    env: { ...env, ...envExtra },
  });
}

describe("resolveLabPort", () => {
  it("accepts the dedicated restore port", () => {
    assert.equal(LAB_PORT, 55433);
    assert.deepEqual(resolveLabPort({ PGPORT: "55433" }), {
      ok: true,
      port: 55433,
    });
  });

  it("rejects a missing port", () => {
    assert.equal(resolveLabPort({}).exitCode, 10);
  });

  it("rejects production and staging ports", () => {
    assert.equal(resolveLabPort({ PGPORT: "5432" }).exitCode, 9);
    assert.equal(resolveLabPort({ PGPORT: "55432" }).exitCode, 9);
  });

  it("rejects non-default port", () => {
    assert.equal(resolveLabPort({ PGPORT: "5433" }).exitCode, 9);
  });

  it("rejects invalid port", () => {
    assert.equal(resolveLabPort({ PGPORT: "abc" }).exitCode, 10);
    assert.equal(resolveLabPort({ PGPORT: "99999" }).exitCode, 10);
  });
});

describe("restore-test-isolated PGPORT guards", () => {
  it("refuses production port 5432 before database commands", () => {
    const r = run(labEnv({ PGPORT: "5432" }));
    assert.equal(r.status, 9);
  });

  it("refuses staging port 55432 before database commands", () => {
    const r = run(labEnv({ PGPORT: "55432" }));
    assert.equal(r.status, 9);
  });

  it("refuses non-default PGPORT before database commands", () => {
    const r = run(labEnv({ PGPORT: "5433" }));
    assert.equal(r.status, 9);
  });

  it("refuses invalid PGPORT", () => {
    const r = run(labEnv({ PGPORT: "not-a-port" }));
    assert.equal(r.status, 10);
  });

  it("allows port 55433 through env guards and stops before a connection", () => {
    const r = run(labEnv());
    assert.equal(r.status, 5);
    assert.notEqual(r.status, 9);
    assert.notEqual(r.status, 8);
    assert.notEqual(r.status, 3);
  });
});
