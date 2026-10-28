import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  convertUsdToLocal,
  formatMoney,
  formatUsdAsLocal,
} from "@/config/pricing";
import { normalizePublicDisplayCurrency } from "@/lib/i18n/display-currencies";
import { resolveUsdToLocalRate } from "@/lib/pricing/display-rates";

describe("display currency conversion", () => {
  it("leaves USD unchanged", () => {
    assert.equal(convertUsdToLocal(9.99, "USD"), 9.99);
    assert.equal(resolveUsdToLocalRate("USD"), 1);
  });

  it("converts INR and NPR from USD using configured rates", () => {
    const inr = convertUsdToLocal(1, "INR");
    const npr = convertUsdToLocal(1, "NPR");
    assert.equal(inr, 95);
    assert.equal(npr, 154);
  });

  it("treats non-finite amounts as zero", () => {
    assert.equal(convertUsdToLocal(Number.NaN, "INR"), 0);
    assert.equal(convertUsdToLocal(Number.POSITIVE_INFINITY, "NPR"), 0);
  });

  it("formats catalog amounts without inventing currencies", () => {
    const usd = formatUsdAsLocal(9.99, "USD", "en-US");
    assert.match(usd, /9\.99/);
    const inr = formatUsdAsLocal(1, "INR", "en-IN");
    assert.ok(inr.includes("95") || inr.includes("₹"));
  });

  it("formats USD with a real locale", () => {
    const out = formatMoney(10, "USD", "en-US");
    assert.ok(out.includes("10"));
  });

  it("rejects unknown public display codes", () => {
    assert.equal(normalizePublicDisplayCurrency("EUR"), "USD");
    assert.equal(normalizePublicDisplayCurrency(""), "USD");
    assert.equal(normalizePublicDisplayCurrency(undefined), "USD");
  });

  it("formats ledger USD without applying display FX", () => {
    const ledger = formatMoney(12.5, "USD", "en-US");
    const displayInr = formatUsdAsLocal(12.5, "INR", "en-IN");
    assert.match(ledger, /12\.50/);
    assert.ok(!ledger.includes("₹"));
    assert.notEqual(ledger, displayInr);
  });
});
