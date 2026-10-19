import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";

import {
  LAB_DATABASE,
  LAB_PORT,
  buildPgRestoreArgs,
} from "./restore-test-isolated.mjs";

const ROOT = path.resolve(new URL("../../..", import.meta.url).pathname);
const SCRIPT = path.join(ROOT, "ops/backup/dr/restore-test-isolated.mjs");
const LAB = "hostingbeyond_restore_test";
const MISSING_DUMP = "/nonexistent/hostingbeyond-restore-drill.dump";

function runScript(argv, envExtra = {}) {
  const env = {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "/tmp",
    ...envExtra,
  };
  return spawnSync("node", [SCRIPT, ...argv], { encoding: "utf8", env });
}

describe("restore-test-isolated command construction", () => {
  it("buildPgRestoreArgs targets lab database with clean/if-exists and no owner/acl", () => {
    const args = buildPgRestoreArgs("127.0.0.1", LAB_PORT, "/tmp/lab.dump");
    assert.deepEqual(args, [
      "-h",
      "127.0.0.1",
      "-p",
      "5432",
      "--clean",
      "--if-exists",
      "--no-owner",
      "--no-acl",
      "-d",
      LAB_DATABASE,
      "/tmp/lab.dump",
    ]);
    assert.ok(!args.includes("hostingbeyond_db"));
  });

  it("prints usage and exits 2 when arguments are missing", () => {
    const r = runScript([]);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /usage: restore-test-isolated\.mjs/);
  });

  it("exits 5 when dump file is missing before any database connection", () => {
    const r = runScript([MISSING_DUMP, LAB]);
    assert.equal(r.status, 5);
  });

  it("refuses disallowed PGSSLMODE before database connection", () => {
    const r = runScript([MISSING_DUMP, LAB], { PGSSLMODE: "verify-full" });
    assert.equal(r.status, 9);
    assert.match(r.stderr, /PGSSLMODE/);
  });
});
