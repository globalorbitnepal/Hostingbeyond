import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildTransferCheckResult,
  transferCheckoutHref,
} from "@/lib/domains/transfer-quote";

describe("transfer quote helpers", () => {
  it("checkout href never includes auth code", () => {
    const href = transferCheckoutHref("Example.COM");
    assert.ok(href.includes("transfer=example.com"));
    assert.equal(href.includes("auth="), false);
  });

  it("buildTransferCheckResult omits price when not purchasable", () => {
    const row = buildTransferCheckResult({
      domain: "x.com",
      status: "unsupported",
      eligible: false,
      message: "n/a",
      transferPrice: 9.99,
      renewPrice: 12,
      purchasable: false,
    });
    assert.equal(row.transferPrice, null);
    assert.equal(row.transferEligibilityConfirmed, false);
  });

  it("eligible registry-only results are not eligibility-confirmed", () => {
    const row = buildTransferCheckResult({
      domain: "taken.com",
      status: "eligible",
      eligible: true,
      message: "appears registered",
      transferPrice: 12,
      renewPrice: 14,
      purchasable: true,
      registryCheckOnly: true,
    });
    assert.equal(row.transferEligibilityConfirmed, false);
    assert.equal(row.registryCheckOnly, true);
  });
});
