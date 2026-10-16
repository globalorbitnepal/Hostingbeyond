import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INTEGRATION_DATABASE_NAME,
  assertIntegrationDatabaseUrl,
} from "@/lib/test/integration-env-loader";

describe("integration-env-loader", () => {
  it("accepts local integration database URL", () => {
    assertIntegrationDatabaseUrl(
      `postgresql://user:secret@127.0.0.1:5432/${INTEGRATION_DATABASE_NAME}?schema=public`,
    );
  });

  it("rejects non-local host", () => {
    assert.throws(
      () =>
        assertIntegrationDatabaseUrl(
          `postgresql://user:secret@db.example.com:5432/${INTEGRATION_DATABASE_NAME}`,
        ),
      /non-local host/,
    );
  });

  it("rejects wrong database name (e.g. dev or production)", () => {
    assert.throws(
      () =>
        assertIntegrationDatabaseUrl(
          "postgresql://user:secret@127.0.0.1:5432/hostingbeyond_db?schema=public",
        ),
      /database must be/,
    );
  });
});
