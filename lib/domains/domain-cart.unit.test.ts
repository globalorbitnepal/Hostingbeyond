import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeTopUpAmount } from "@/lib/payments/wallet-payment-service";

describe("Domain cart prerequisites", () => {
  it("rejects client-controlled invalid top-up amounts", () => {
    assert.equal(normalizeTopUpAmount(3), null);
  });
});
