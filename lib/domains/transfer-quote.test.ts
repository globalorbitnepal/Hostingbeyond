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
  });
});
