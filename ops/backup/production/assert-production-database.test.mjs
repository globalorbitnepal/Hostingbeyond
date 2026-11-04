import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const SCRIPT = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "assert-production-database.mjs",
);

const productionEnv = {
  PGHOST: "127.0.0.1",
  PGPORT: "5432",
  PGDATABASE: "hostingbeyond_db",
  PGUSER: "hostingbeyond_user",
  PGPASSWORD: "unused-test-value",
};

function run(env) {
  return spawnSync("node", [SCRIPT], { encoding: "utf8", env });
}

describe("assert-production-database.mjs", () => {
  it("allows the exact production target", () => {
    const r = run({ ...productionEnv, PATH: process.env.PATH });
    assert.equal(r.status, 0);
    assert.doesNotMatch(r.stderr, /unused-test-value/);
  });

  it("rejects a database name without the rest of the identity", () => {
    const r = run({
      PATH: process.env.PATH,
      PGDATABASE: "hostingbeyond_db",
    });
    assert.equal(r.status, 7);
  });

  it("rejects staging port, restore port, remote host, and staging role", () => {
    assert.equal(run({ ...productionEnv, PATH: process.env.PATH, PGPORT: "55432" }).status, 7);
    assert.equal(run({ ...productionEnv, PATH: process.env.PATH, PGPORT: "55433" }).status, 7);
    assert.equal(run({ ...productionEnv, PATH: process.env.PATH, PGHOST: "203.0.113.5" }).status, 7);
    assert.equal(
      run({ ...productionEnv, PATH: process.env.PATH, PGUSER: "hostingbeyond_integration_user" }).status,
      7,
    );
    assert.equal(
      run({ ...productionEnv, PATH: process.env.PATH, PGDATABASE: "hostingbeyond_integration_test" }).status,
      7,
    );
    assert.equal(run({ ...productionEnv, PATH: process.env.PATH, PGPASSWORD: "" }).status, 7);
  });
});
