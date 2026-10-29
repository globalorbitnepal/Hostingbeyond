import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { usdToLocalRate } from "@/config/pricing";
import {
  isConfiguredDisplayCurrency,
  normalizePublicDisplayCurrency,
  PUBLIC_DISPLAY_CURRENCIES,
  PUBLIC_DISPLAY_CURRENCY_LABELS,
} from "@/lib/i18n/display-currencies";

describe("display-currencies", () => {
  it("is derived from the configured rate book, never a hand list", () => {
    const configured = Object.entries(usdToLocalRate)
      .filter(([, rate]) => Number.isFinite(rate) && rate > 0)
      .map(([code]) => code)
      .sort();
    assert.deepEqual([...PUBLIC_DISPLAY_CURRENCIES].sort(), configured);
  });

  it("keeps USD first as the checkout currency", () => {
    assert.equal(PUBLIC_DISPLAY_CURRENCIES[0], "USD");
  });

  it("includes the currencies the brief asks for where a price exists", () => {
    for (const code of ["USD", "NPR", "INR", "GBP", "EUR", "AUD", "CAD"]) {
      assert.ok(
        PUBLIC_DISPLAY_CURRENCIES.includes(code as never),
        `${code} should be offerable`,
      );
    }
  });

  it("does NOT invent RUB or CNY without a configured rate", () => {
    assert.equal(isConfiguredDisplayCurrency("RUB"), false);
    assert.equal(isConfiguredDisplayCurrency("CNY"), false);
  });

  it("falls back unknown or unconfigured codes to USD", () => {
    assert.equal(normalizePublicDisplayCurrency("EUR"), "EUR");
    assert.equal(normalizePublicDisplayCurrency("RUB"), "USD");
    assert.equal(normalizePublicDisplayCurrency("XYZ"), "USD");
    assert.equal(normalizePublicDisplayCurrency("inr"), "INR");
    assert.equal(normalizePublicDisplayCurrency(""), "USD");
  });

  it("labels every offerable currency from Intl metadata", () => {
    for (const code of PUBLIC_DISPLAY_CURRENCIES) {
      const meta = PUBLIC_DISPLAY_CURRENCY_LABELS[code];
      assert.equal(meta.code, code);
      assert.ok(meta.title.length > 0);
      assert.ok(meta.symbol.length > 0);
    }
    assert.equal(PUBLIC_DISPLAY_CURRENCY_LABELS.USD.symbol, "$");
    assert.equal(PUBLIC_DISPLAY_CURRENCY_LABELS.INR.symbol, "₹");
  });
});
