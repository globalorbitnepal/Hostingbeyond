import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getDomainProtectionProductConfig } from "@/lib/domains/domain-protection-product";

describe("domain protection product config", () => {
  it("stays disabled without explicit service definition env", () => {
    const prev = process.env.DOMAIN_PROTECTION_PAID_ENABLED;
    const prevDef = process.env.DOMAIN_PROTECTION_SERVICE_DEFINED;
    delete process.env.DOMAIN_PROTECTION_PAID_ENABLED;
    delete process.env.DOMAIN_PROTECTION_SERVICE_DEFINED;
    const cfg = getDomainProtectionProductConfig();
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.proposedRetailUsdPerYear, 9.99);
    if (prev !== undefined) process.env.DOMAIN_PROTECTION_PAID_ENABLED = prev;
    if (prevDef !== undefined) {
      process.env.DOMAIN_PROTECTION_SERVICE_DEFINED = prevDef;
    }
  });
});
