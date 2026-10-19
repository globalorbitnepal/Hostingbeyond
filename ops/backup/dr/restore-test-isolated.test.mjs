import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const SCRIPT = path.join(ROOT, "ops/backup/dr/restore-test-isolated.mjs");
const LAB = "hostingbeyond_restore_test";
const MISSING_DUMP = "/nonexistent/hostingbeyond-restore-guard.dump";

function run(argv3, envExtra = {}) {
  const env = {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "/tmp",
    ...envExtra,
  };
  return spawnSync("node", [SCRIPT, MISSING_DUMP, argv3], {
    encoding: "utf8",
    env,
  });
}

describe("restore-test-isolated.mjs", () => {
  it("refuses production-like database names", () => {
    const r = run("hostingbeyond_db");
    assert.equal(r.status, 3);
  });

  it("refuses integration test database name as restore target", () => {
    const r = run("hostingbeyond_integration_test");
    assert.equal(r.status, 3);
  });

  it("refuses alternate restore_test names (lab name is fixed)", () => {
    const r = run("myapp_restore_test");
    assert.equal(r.status, 3);
  });

  it("refuses non-local PGHOST", () => {
    const r = run(LAB, { PGHOST: "203.0.113.1" });
    assert.equal(r.status, 8);
  });

  it("refuses DATABASE_URL before pg_restore", () => {
    const r = run(LAB, {
      DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/hostingbeyond_db",
    });
    assert.equal(r.status, 9);
  });

  it("refuses PGSERVICE before pg_restore", () => {
    const r = run(LAB, { PGSERVICE: "myservice" });
    assert.equal(r.status, 9);
  });

  it("refuses PGDATABASE mismatch before pg_restore", () => {
    const r = run(LAB, { PGDATABASE: "hostingbeyond_db" });
    assert.equal(r.status, 9);
  });

  it("refuses PGHOSTADDR (libpq host override)", () => {
    const r = run(LAB, { PGHOSTADDR: "203.0.113.1" });
    assert.equal(r.status, 9);
  });

  it("refuses PGSERVICEFILE", () => {
    const r = run(LAB, { PGSERVICEFILE: "/tmp/pg_service.conf" });
    assert.equal(r.status, 9);
  });

  it("refuses PGOPTIONS", () => {
    const r = run(LAB, { PGOPTIONS: "-c search_path=public" });
    assert.equal(r.status, 9);
  });
});
