import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_DOMAIN_PROTECTION_USD,
  extrasFromSiteSettings,
  mergeDomainExtras,
  protectionChargeUsd,
} from "@/lib/domains/domain-extras";

describe("domain extras", () => {
  it("keeps WHOIS privacy free and Domain Protection at $9.99 by default", () => {
    const extras = mergeDomainExtras(null);
    assert.equal(extras.privacyFree, true);
    assert.equal(extras.protectionEnabled, true);
    assert.equal(extras.protectionPriceUsd, DEFAULT_DOMAIN_PROTECTION_USD);
    assert.equal(protectionChargeUsd(extras), 9.99);
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
