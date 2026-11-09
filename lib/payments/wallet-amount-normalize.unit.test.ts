import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeAdminWalletAmount,
  normalizeTopUpAmount,
} from "@/lib/payments/wallet-payment-service";

describe("wallet amount normalisation", () => {
  it("keeps the customer top-up floor at $5", () => {
    assert.equal(normalizeTopUpAmount(4.99), null);
    assert.equal(normalizeTopUpAmount(5), 5);
    assert.equal(normalizeTopUpAmount(10_000.01), null);
  });

  it("lets admins credit and debit small amounts", () => {
    assert.equal(normalizeAdminWalletAmount(0.01), 0.01);
    assert.equal(normalizeAdminWalletAmount(1.5), 1.5);
    assert.equal(normalizeAdminWalletAmount(0), null);
    assert.equal(normalizeAdminWalletAmount(Number.NaN), null);
    assert.equal(normalizeAdminWalletAmount(10_000.01), null);
  });

  it("rounds to cents", () => {
    assert.equal(normalizeAdminWalletAmount(2.345), 2.35);
  });
});
