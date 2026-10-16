import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertIntegrationDatabaseTarget,
  isIntegrationDatabaseConfigured,
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
    process.env.DATABASE_URL = `postgresql://u:p@127.0.0.1:5432/${INTEGRATION_DATABASE_NAME}?schema=public`;
    assert.equal(isIntegrationDatabaseConfigured(), true);
    process.env.DATABASE_URL = prev;
  });
});
