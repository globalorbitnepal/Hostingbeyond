import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INTEGRATION_DATABASE_NAME } from "@/lib/test/integration-env-loader";
import {
  checkIsolatedIntegrationDatabaseUrl,
  isForbiddenProductionRole,
} from "@/lib/test/isolated-database-policy";

describe("isolated database policy", () => {
  it("rejects missing, production db, and production role", () => {
    assert.equal(checkIsolatedIntegrationDatabaseUrl(undefined).ok, false);
    const prodDb = checkIsolatedIntegrationDatabaseUrl(
      "postgresql://other@127.0.0.1:5432/hostingbeyond_db",
    );
    assert.equal(prodDb.ok, false);
    if (!prodDb.ok)
      assert.match(prodDb.reason, /forbidden production database/);

    const prodRole = checkIsolatedIntegrationDatabaseUrl(
      `postgresql://hostingbeyond_user:x@127.0.0.1:5432/${INTEGRATION_DATABASE_NAME}`,
    );
    assert.equal(prodRole.ok, false);
    if (!prodRole.ok)
      assert.match(prodRole.reason, /production application role/);
    assert.equal(isForbiddenProductionRole("hostingbeyond_user"), true);
  });

  it("accepts a dedicated local integration role", () => {
    const ok = checkIsolatedIntegrationDatabaseUrl(
      `postgresql://hostingbeyond_integration_user:x@127.0.0.1:5432/${INTEGRATION_DATABASE_NAME}`,
    );
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.meta.database, INTEGRATION_DATABASE_NAME);
      assert.equal(ok.meta.role, "hostingbeyond_integration_user");
      assert.equal(JSON.stringify(ok).includes(":x@"), false);
    }
  });

  it("rejects remote hosts", () => {
    const remote = checkIsolatedIntegrationDatabaseUrl(
      `postgresql://hostingbeyond_integration_user:x@db.example.com:5432/${INTEGRATION_DATABASE_NAME}`,
    );
    assert.equal(remote.ok, false);
  });
});
