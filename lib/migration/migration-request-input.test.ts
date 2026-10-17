import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  migrationRequestBodySchema,
  normalizeMigrationRequestBody,
  resolveMigrationCustomerEmail,
} from "@/lib/migration/migration-request-input";

describe("migrationRequestBodySchema", () => {
  it("rejects forged userId in body", () => {
    const r = migrationRequestBodySchema.safeParse({
      customerName: "Ada",
      customerEmail: "ada@example.com",
      userId: "other-user",
    });
    assert.equal(r.success, false);
  });

  it("accepts minimal valid payload", () => {
    const r = migrationRequestBodySchema.safeParse({
      customerName: "Ada Lovelace",
      customerEmail: "ada@example.com",
    });
    assert.equal(r.success, true);
  });
});

describe("resolveMigrationCustomerEmail", () => {
  it("uses session email when authenticated", () => {
    assert.equal(
      resolveMigrationCustomerEmail("real@customer.com", "forged@evil.com"),
      "real@customer.com",
    );
  });

  it("uses body email when anonymous", () => {
    assert.equal(
      resolveMigrationCustomerEmail(null, "guest@example.com"),
      "guest@example.com",
    );
  });
});

describe("normalizeMigrationRequestBody", () => {
  it("normalizes email to lowercase", () => {
    const n = normalizeMigrationRequestBody({
      customerName: "Test",
      customerEmail: "UPPER@Example.COM",
    });
    assert.equal(n.customerEmail, "upper@example.com");
  });
});
