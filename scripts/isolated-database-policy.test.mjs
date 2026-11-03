import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkIsolatedIntegrationDatabaseUrl } from "./isolated-database-policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("scripts/isolated-database-policy", () => {
  it("fails closed on the production application role", () => {
    const result = checkIsolatedIntegrationDatabaseUrl(
      "postgresql://hostingbeyond_user:secret@127.0.0.1:5432/hostingbeyond_integration_test",
    );
    assert.equal(result.ok, false);
    assert.equal(JSON.stringify(result).includes("secret"), false);
  });

  it("assert-isolated-database exits 1 without DATABASE_URL", () => {
    const probe = spawnSync(
      "node",
      ["scripts/assert-isolated-database.mjs"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: { ...process.env, DATABASE_URL: "" },
      },
    );
    assert.equal(probe.status, 1);
    assert.match(probe.stderr, /ISOLATED_DB_FAIL/);
    assert.equal(probe.stderr.includes("postgresql://"), false);
  });

  it("ci-assert-integration-database rejects production application role", () => {
    const probe = spawnSync(
      "node",
      ["scripts/ci-assert-integration-database.mjs"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          DATABASE_URL:
            "postgresql://hostingbeyond_user:example-only@127.0.0.1:5432/hostingbeyond_integration_test",
        },
      },
    );
    assert.equal(probe.status, 1);
    assert.match(probe.stderr, /CI_DATABASE_FAIL.*production application role/);
    assert.equal(probe.stderr.includes("example-only"), false);
  });
});
