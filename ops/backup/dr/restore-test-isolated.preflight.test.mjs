import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { FORBIDDEN_CONN_ENV, LAB_DATABASE, LAB_PORT } from "./restore-test-isolated.mjs";

const SCRIPT = path.join(
  path.resolve(new URL(".", import.meta.url).pathname),
  "restore-test-isolated.mjs",
);

describe("restore-test-isolated preflight (static, matches RESTORE-DRILL-LAB.md)", () => {
  const text = fs.readFileSync(SCRIPT, "utf8");

  it("checks dump exists before any psql current_database guard", () => {
    const existsIdx = text.indexOf("if (!fs.existsSync(dump)) process.exit(5)");
    const emptyIdx = text.indexOf("dumpStat.size < 1");
    const toolsIdx = text.indexOf("missing tool");
    const preRestoreIdx = text.indexOf(
      'assertCurrentDatabase(host, port, connEnv, "pre-restore")',
    );
    assert.ok(existsIdx >= 0, "missing dump exit 5");
    assert.ok(emptyIdx > existsIdx, "empty dump must be rejected after exists check");
    assert.ok(toolsIdx > emptyIdx, "tool check after dump artifact check");
    assert.ok(preRestoreIdx >= 0, "missing pre-restore current_database check");
    assert.ok(
      existsIdx < preRestoreIdx,
      "dump file must be validated before first database command",
    );
    assert.ok(toolsIdx < preRestoreIdx, "missing tools must fail before psql");
  });

  it("runs current_database checks before pg_restore", () => {
    const beforeRestoreIdx = text.indexOf(
      'assertCurrentDatabase(host, port, connEnv, "immediately-before-pg_restore")',
    );
    const pgRestoreIdx = text.indexOf('spawnSync("pg_restore"');
    assert.ok(beforeRestoreIdx >= 0 && pgRestoreIdx > beforeRestoreIdx);
  });

  it("documents lab database and port constants used by runbook", () => {
    assert.equal(LAB_DATABASE, "hostingbeyond_restore_test");
    assert.equal(LAB_PORT, 5432);
    assert.match(text, /_prisma_migrations/);
    assert.match(text, /migrationRows > 0 \? "PASS" : "FAIL"/);
  });

  it("forbids libpq overrides listed in ISOLATED-RESTORE-SETUP.md", () => {
    assert.match(
      text,
      /console\.error\(`restore-test-isolated: refuse \$\{key\} in environment`\)/,
    );
    for (const key of [
      "DATABASE_URL",
      "PGSERVICE",
      "PGSERVICEFILE",
      "PGHOSTADDR",
      "PGOPTIONS",
    ]) {
      assert.ok(
        FORBIDDEN_CONN_ENV.includes(key),
        `FORBIDDEN_CONN_ENV must include ${key}`,
      );
    }
  });
});
