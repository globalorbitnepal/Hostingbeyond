import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PROVIDER_CHECKOUT_CURRENCIES,
  chargesInSelectedCurrency,
  isZeroDecimalCurrency,
  resolveSettlementCurrency,
  toProviderMinorUnits,
} from "@/lib/payments/settlement-currency";

describe("settlement currency", () => {
  it("charges in the selected currency when the provider supports it", () => {
    assert.equal(resolveSettlementCurrency("EUR"), "EUR");
    assert.equal(resolveSettlementCurrency("gbp"), "GBP");
    assert.equal(chargesInSelectedCurrency("EUR"), true);
  });

  it("falls back to the account currency for unsupported codes", () => {
    assert.equal(PROVIDER_CHECKOUT_CURRENCIES.has("NPR"), false);
    assert.equal(resolveSettlementCurrency("NPR", "USD"), "USD");
    assert.equal(chargesInSelectedCurrency("NPR"), false);
  });

  it("uses minor units and respects zero-decimal currencies", () => {
    assert.equal(toProviderMinorUnits(12.34, "USD"), 1234);
    assert.equal(toProviderMinorUnits(1500, "JPY"), 1500);
    assert.equal(isZeroDecimalCurrency("jpy"), true);
    assert.equal(isZeroDecimalCurrency("eur"), false);
  });
});
