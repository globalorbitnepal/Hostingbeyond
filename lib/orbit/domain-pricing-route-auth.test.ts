import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  authorizeDomainPricingAdmin,
  pricingUnauthorizedResponse,
} from "@/lib/orbit/domain-pricing-auth";

describe("Orbit domain-pricing authorization", () => {
  it("returns 401 JSON when loader yields null", async () => {
    const result = await authorizeDomainPricingAdmin(async () => null);
    assert.ok(result instanceof Response);
    assert.equal(result.status, 401);
    const body = await result.json();
    assert.equal(body.error, "Unauthorized");
  });

  it("returns admin when loader succeeds", async () => {
    const now = new Date();
    const fake = {
      id: "admin-test",
      displayName: "Test Admin",
      createdAt: now,
      updatedAt: now,
    };
    const result = await authorizeDomainPricingAdmin(async () => fake);
    assert.deepEqual(result, fake);
  });

  it("pricingUnauthorizedResponse matches route contract", async () => {
    const res = pricingUnauthorizedResponse();
    assert.equal(res.status, 401);
  });
});
