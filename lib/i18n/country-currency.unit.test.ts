import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  COUNTRY_DISPLAY_CURRENCY,
  currencyNoticeFor,
  resolveCountryDisplayCurrency,
} from "@/lib/i18n/country-currency";
import { isConfiguredDisplayCurrency } from "@/lib/i18n/display-currencies";

describe("country → display currency", () => {
  it("maps the countries in the brief to their currencies", () => {
    const cases: [string, string][] = [
      ["NP", "NPR"],
      ["US", "USD"],
      ["GB", "GBP"],
      ["IN", "INR"],
      ["AU", "AUD"],
      ["CA", "CAD"],
      ["DE", "EUR"],
      ["FR", "EUR"],
      ["ES", "EUR"],
      ["JP", "JPY"],
      ["BD", "BDT"],
      ["BR", "BRL"],
      ["CN", "CNY"],
      ["RU", "RUB"],
    ];
    for (const [country, currency] of cases) {
      assert.equal(
        COUNTRY_DISPLAY_CURRENCY[country],
        currency,
        `${country} → ${currency}`,
      );
    }
  });

  it("requests RUB for Russia and CNY for China", () => {
    assert.equal(COUNTRY_DISPLAY_CURRENCY.RU, "RUB");
    assert.equal(COUNTRY_DISPLAY_CURRENCY.CN, "CNY");
  });

  it("resolves exact currencies when a configured price exists", () => {
    for (const country of ["NP", "US", "GB", "IN", "AU", "CA", "DE", "FR"]) {
      const resolved = resolveCountryDisplayCurrency(country);
      assert.equal(resolved.exact, true, `${country} should be exact`);
      assert.ok(isConfiguredDisplayCurrency(resolved.currency));
    }
  });

  it("resolves CNY and RUB when those rates are in the price book", () => {
    for (const [country, currency] of [
      ["CN", "CNY"],
      ["RU", "RUB"],
    ] as const) {
      const resolved = resolveCountryDisplayCurrency(country);
      assert.equal(resolved.exact, true, country);
      assert.equal(resolved.currency, currency);
      assert.ok(isConfiguredDisplayCurrency(resolved.currency));
    }
  });

  it("never returns a currency without a configured price", () => {
    for (const country of Object.keys(COUNTRY_DISPLAY_CURRENCY)) {
      const resolved = resolveCountryDisplayCurrency(country);
      assert.ok(
        isConfiguredDisplayCurrency(resolved.currency),
        `${country} resolved to unconfigured ${resolved.currency}`,
      );
    }
  });

  it("falls back for unknown countries without throwing", () => {
    const resolved = resolveCountryDisplayCurrency("ZZ");
    assert.equal(resolved.currency, "USD");
    assert.equal(resolveCountryDisplayCurrency(null).currency, "USD");
  });

  it("states both display and checkout currency in the notice", () => {
    const exact = currencyNoticeFor(resolveCountryDisplayCurrency("NP"));
    assert.match(exact, /NPR/);
    assert.match(exact, /USD/);

    const ru = currencyNoticeFor(resolveCountryDisplayCurrency("RU"));
    assert.match(ru, /RUB/);
    assert.match(ru, /Checkout is charged in USD/);
  });

  it("mentions a manual override instead of claiming the country default", () => {
    const note = currencyNoticeFor(resolveCountryDisplayCurrency("NP"), {
      appliedCurrency: "USD",
    });
    assert.match(note, /USD/);
    assert.match(note, /your choice/i);
  });

  it("never implies a different checkout currency than USD", () => {
    for (const country of ["NP", "US", "DE", "RU"]) {
      const note = currencyNoticeFor(resolveCountryDisplayCurrency(country));
      assert.match(note, /Checkout is charged in USD/);
    }
  });
});
