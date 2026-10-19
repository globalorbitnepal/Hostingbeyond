import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { LAB_PORT, resolveLabPort } from "./restore-test-isolated.mjs";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const SCRIPT = path.join(ROOT, "ops/backup/dr/restore-test-isolated.mjs");
const LAB = "hostingbeyond_restore_test";
const MISSING_DUMP = "/nonexistent/hostingbeyond-restore-test.dump";

function run(envExtra = {}) {
  const env = { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "/tmp" };
  return spawnSync("node", [SCRIPT, MISSING_DUMP, LAB], {
    encoding: "utf8",
    env: { ...env, ...envExtra },
  });
}

describe("resolveLabPort", () => {
  it("accepts documented lab port", () => {
    assert.deepEqual(resolveLabPort({ PGPORT: "5432" }), {
      ok: true,
      port: LAB_PORT,
    });
    assert.deepEqual(resolveLabPort({}), { ok: true, port: LAB_PORT });
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
  it("refuses non-default PGPORT before database commands", () => {
    const r = run({ PGPORT: "5433" });
    assert.equal(r.status, 9);
  });

  it("refuses invalid PGPORT", () => {
    const r = run({ PGPORT: "not-a-port" });
    assert.equal(r.status, 10);
  });

  it("allows approved PGPORT through env guards", () => {
    const r = run({ PGPORT: "5432" });
    assert.notEqual(r.status, 9, "port must not be rejected as unapproved");
    assert.notEqual(r.status, 10, "port must not be rejected as malformed");
    assert.notEqual(r.status, 8, "host guard should pass with defaults");
    assert.notEqual(r.status, 3, "lab database name must be accepted");
  });
});
