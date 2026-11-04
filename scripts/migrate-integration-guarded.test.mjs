import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

/**
 * Script-level tests for the guarded migration runner.
 *
 * Every case here is safe: no case reaches `prisma`, and no case opens a socket.
 * Rejected targets exit before the preflight scripts, and accepted targets are
 * only exercised with `--dry-run` or `--identity-only`, neither of which spawns
 * Prisma. A `--dry-run` case asserts that no TCP connection attempt happens.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "scripts/migrate-integration-guarded.mjs");

const VALID =
  "postgresql://hb_integration_user:pw_not_real@127.0.0.1:55432/hostingbeyond_integration_test";

function run(env, args = ["--dry-run"]) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ...env },
    timeout: 30_000,
  });
}

describe("migrate-integration-guarded: fail-closed rejections", () => {
  it("refuses to run when DATABASE_URL is absent", () => {
    const result = run({ DATABASE_URL: "" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /MIGRATION_GUARD_FAIL: target_rejected: DATABASE_URL is not set/);
  });

  it("never falls back to .env when DATABASE_URL is unset", () => {
    // `.env` in this checkout targets the production database. An unset
    // variable must be rejected, not loaded from the file.
    const result = run({ DATABASE_URL: "" });
    const combined = `${result.stdout}${result.stderr}`;
    assert.equal(result.status, 1);
    assert.equal(combined.includes("hostingbeyond_db"), false, "must not read .env");
    assert.equal(combined.includes("ISOLATED_DB_OK"), false, "must not reach guards");
  });

  it("refuses the production database name", () => {
    const result = run({
      DATABASE_URL:
        "postgresql://hb_integration_user:pw_not_real@127.0.0.1:5432/hostingbeyond_db",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /forbidden production database name/);
  });

  it("refuses the production application role", () => {
    const result = run({
      DATABASE_URL:
        "postgresql://hostingbeyond_user:pw_not_real@127.0.0.1:5432/hostingbeyond_integration_test",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /production application role is not allowed/);
  });

  it("refuses a non-loopback host", () => {
    const result = run({
      DATABASE_URL:
        "postgresql://hb_integration_user:pw_not_real@10.1.2.3:5432/hostingbeyond_integration_test",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /host must be loopback/);
  });

  it("refuses a missing explicit port", () => {
    const result = run({
      DATABASE_URL:
        "postgresql://hb_integration_user:pw_not_real@127.0.0.1/hostingbeyond_integration_test",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /explicit port/);
  });

  it("refuses malformed URLs", () => {
    const result = run({ DATABASE_URL: "not-a-url" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /not a valid URL/);
  });

  it("refuses an unknown flag rather than ignoring it", () => {
    const result = run({ DATABASE_URL: VALID }, ["--force"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unknown_flag/);
  });

  it("never prints the password or the full URL", () => {
    for (const env of [
      { DATABASE_URL: VALID },
      {
        DATABASE_URL:
          "postgresql://hostingbeyond_user:pw_not_real@127.0.0.1:5432/hostingbeyond_integration_test",
      },
      { DATABASE_URL: "" },
    ]) {
      const result = run(env);
      const combined = `${result.stdout}${result.stderr}`;
      assert.equal(combined.includes("pw_not_real"), false, "password must never appear");
      assert.equal(combined.includes("postgresql://"), false, "full URL must never appear");
    }
  });
});

describe("migrate-integration-guarded: accepted target, no database access", () => {
  it("accepts a valid target and reports a redacted plan under --dry-run", () => {
    const result = run({ DATABASE_URL: VALID });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const combined = `${result.stdout}${result.stderr}`;
    assert.match(
      combined,
      /target accepted: hb_integration_user@127\.0\.0\.1:55432\/hostingbeyond_integration_test/,
    );
    // The preflight scripts run and must pass.
    assert.match(combined, /assert-isolated-database\.mjs: ok/);
    assert.match(combined, /ci-assert-integration-database\.mjs: ok/);
    assert.match(combined, /dry run: no psql query and no Prisma invocation performed/);
    assert.equal(combined.includes("prisma migrate deploy"), false, "must not spawn Prisma");
    assert.equal(combined.includes("pw_not_real"), false);
  });

  it("--help exits 0 without requiring DATABASE_URL", () => {
    const result = run({ DATABASE_URL: "" }, ["--help"]);
    assert.equal(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /identity-only/);
  });
});
