import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertIntegrationDatabaseTarget,
  isIntegrationCredentialIsolated,
  isIntegrationDatabaseConfigured,
  shouldRunDatabaseIntegrationTests,
} from "@/lib/test/integration-gate";
import { INTEGRATION_DATABASE_NAME } from "@/lib/test/integration-env-loader";

describe("integration-gate", () => {
  it("rejects hostingbeyond_db name", () => {
    const prev = process.env.DATABASE_URL;
    process.env.DATABASE_URL =
      "postgresql://u:p@127.0.0.1:5432/hostingbeyond_db?schema=public";
    assert.equal(isIntegrationDatabaseConfigured(), false);
    assert.throws(() => assertIntegrationDatabaseTarget(), /database must be/);
    process.env.DATABASE_URL = prev;
  });

  it("accepts integration database name", () => {
    const prev = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `postgresql://u:p@127.0.0.1:55432/${INTEGRATION_DATABASE_NAME}?schema=public`;
    assert.equal(isIntegrationDatabaseConfigured(), true);
    assert.equal(isIntegrationCredentialIsolated(), true);
    process.env.DATABASE_URL = prev;
  });

  it("rejects the production application role even on the integration database", () => {
    const prev = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `postgresql://hostingbeyond_user:p@127.0.0.1:5432/${INTEGRATION_DATABASE_NAME}?schema=public`;
    assert.equal(isIntegrationDatabaseConfigured(), true);
    assert.equal(isIntegrationCredentialIsolated(), false);
    assert.equal(shouldRunDatabaseIntegrationTests(), false);
    assert.throws(
      () => assertIntegrationDatabaseTarget(),
      /production application role/,
    );
    process.env.DATABASE_URL = prev;
  });
});
