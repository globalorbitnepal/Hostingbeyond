import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "integration-database-ready.mjs",
);

function runReady(env) {
  return spawnSync(process.execPath, [script], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

describe("integration-database-ready", () => {
  it("rejects wrong database name without connecting", () => {
    const result = runReady({
      DATABASE_URL:
        "postgresql://hb_ci:hb_ci_test_only@127.0.0.1:5432/hostingbeyond_db?schema=public",
    });
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /forbidden production database name|database must be hostingbeyond_integration_test/,
    );
  });

  it("rejects the production application role on the integration database", () => {
    const result = runReady({
      DATABASE_URL:
        "postgresql://hostingbeyond_user:hb_ci_test_only@127.0.0.1:5432/hostingbeyond_integration_test",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /production application role/);
    assert.equal(result.stderr.includes("hb_ci_test_only"), false);
  });

  it("rejects non-local host without connecting", () => {
    const result = runReady({
      DATABASE_URL:
        "postgresql://hb_ci:hb_ci_test_only@db.example.com:5432/hostingbeyond_integration_test",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /host must be local/);
  });
});
