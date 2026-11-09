import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_DOMAIN_PROTECTION_USD,
  extrasFromSiteSettings,
  mergeDomainExtras,
  protectionChargeUsd,
} from "@/lib/domains/domain-extras";

const FREE_ENV = {
  DOMAIN_PROTECTION_PAID_ENABLED: process.env.DOMAIN_PROTECTION_PAID_ENABLED,
  DOMAIN_PROTECTION_SERVICE_DEFINED:
    process.env.DOMAIN_PROTECTION_SERVICE_DEFINED,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(FREE_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe("domain extras", () => {
  it("keeps WHOIS privacy free and Domain Protection at $9.99 in the catalogue", () => {
    const extras = mergeDomainExtras(null);
    assert.equal(extras.privacyFree, true);
    assert.equal(extras.protectionEnabled, true);
    assert.equal(extras.protectionPriceUsd, DEFAULT_DOMAIN_PROTECTION_USD);
  });

  it("never charges for NameSilo's free privacy when no paid service exists", () => {
    delete process.env.DOMAIN_PROTECTION_PAID_ENABLED;
    delete process.env.DOMAIN_PROTECTION_SERVICE_DEFINED;
    try {
      const extras = mergeDomainExtras(null);
      assert.equal(protectionChargeUsd(extras), 0);
    } finally {
      restoreEnv();
    }
  });

  it("charges only when the paid product is explicitly enabled", () => {
    process.env.DOMAIN_PROTECTION_PAID_ENABLED = "true";
    process.env.DOMAIN_PROTECTION_SERVICE_DEFINED = "registry-lock-2026";
    try {
      assert.equal(protectionChargeUsd(mergeDomainExtras(null)), 9.99);
    } finally {
      restoreEnv();
    }
  });

  it("never charges protection when disabled or zero", () => {
    assert.equal(
      protectionChargeUsd(
        mergeDomainExtras({
          protectionEnabled: false,
          protectionPriceUsd: 9.99,
        }),
      ),
      0,
    );
    assert.equal(
      protectionChargeUsd(mergeDomainExtras({ protectionPriceUsd: 0 })),
      0,
    );
  });

  it("reads extras from Orbit site settings without inventing prices", () => {
    const extras = extrasFromSiteSettings({
      domainPrivacyFree: true,
      domainProtectionEnabled: true,
      domainProtectionPriceUsd: 9.99,
      domainProtectionLabel: "Domain Protection",
    });
    assert.equal(extras.privacyFree, true);
    assert.equal(extras.protectionPriceUsd, 9.99);
  });
});
