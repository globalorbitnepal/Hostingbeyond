import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  defaultPreferences,
  normalizePreferences,
  parsePreferencesCookie,
  serializePreferences,
} from "@/lib/i18n/preferences";

describe("locale preference parsing", () => {
  it("defaults to English (US) and USD", () => {
    const prefs = parsePreferencesCookie(undefined);
    assert.equal(prefs.language, "en");
    assert.equal(prefs.country, defaultPreferences.country);
    assert.equal(prefs.currency, "USD");
    assert.equal(prefs.googleTargetLang, "en");
  });

  it("derives the display currency from the selected country", () => {
    const np = normalizePreferences({ country: "NP", localeMarketId: "NP-ne" });
    assert.equal(np.country, "NP");
    assert.equal(np.currency, "NPR");

    const gb = normalizePreferences({ country: "GB", localeMarketId: "GB-en" });
    assert.equal(gb.currency, "GBP");

    const inr = normalizePreferences({
      country: "IN",
      localeMarketId: "IN-hi",
    });
    assert.equal(inr.currency, "INR");
  });

  it("falls back to USD for a country without a configured price list", () => {
    const ru = normalizePreferences({ country: "RU", localeMarketId: "RU-ru" });
    assert.equal(ru.country, "RU");
    assert.equal(ru.currency, "USD");
  });

  it("keeps an explicit manual currency choice when locked", () => {
    const prefs = normalizePreferences({
      country: "NP",
      localeMarketId: "NP-ne",
      currency: "USD",
      currencyLocked: true,
    });
    assert.equal(prefs.country, "NP");
    assert.equal(prefs.currency, "USD");
    assert.equal(prefs.currencyLocked, true);
  });

  it("re-derives currency from country when the choice is not locked", () => {
    const prefs = normalizePreferences({
      country: "NP",
      localeMarketId: "NP-ne",
      currency: "USD",
      currencyLocked: false,
    });
    assert.equal(prefs.currency, "NPR");
  });

  it("keeps Hindi Google Translate for India while HTML copy stays English", () => {
    const prefs = normalizePreferences({
      localeMarketId: "IN-hi",
      language: "hi",
      googleTargetLang: "hi",
      currency: "INR",
    });
    assert.equal(prefs.language, "en");
    assert.equal(prefs.googleTargetLang, "hi");
    assert.equal(prefs.country, "IN");
    assert.equal(prefs.currency, "INR");
  });

  it("keeps language independent of country and currency", () => {
    const prefs = normalizePreferences({
      country: "US",
      localeMarketId: "US-en",
      googleTargetLang: "ko",
      currencyLocked: true,
      currency: "USD",
    });
    assert.equal(prefs.country, "US");
    assert.equal(prefs.currency, "USD");
    assert.equal(prefs.googleTargetLang, "ko");
  });

  it("rejects unconfigured display currencies without inventing a rate", () => {
    /** Unlocked currency is derived from the country, so US yields USD. */
    const eur = normalizePreferences({ currency: "EUR" as never });
    assert.equal(eur.currency, "USD");

    /** A locked, configured choice is honoured. */
    const lockedEur = normalizePreferences({
      country: "DE",
      localeMarketId: "DE-de",
      currency: "EUR" as never,
      currencyLocked: true,
    });
    assert.equal(lockedEur.currency, "EUR");

    /** A locked but unconfigured code still falls back — no invented rate. */
    const lockedRub = normalizePreferences({
      country: "RU",
      localeMarketId: "RU-ru",
      currency: "RUB" as never,
      currencyLocked: true,
    });
    assert.equal(lockedRub.currency, "USD");
  });

  it("returns defaults for malformed cookies", () => {
    const prefs = parsePreferencesCookie("{not-json");
    assert.deepEqual(prefs, defaultPreferences);
  });

  it("round-trips through the cookie serializer", () => {
    const prefs = normalizePreferences({
      country: "NP",
      localeMarketId: "NP-ne",
      currencyLocked: true,
      currency: "USD",
    });
    const roundTripped = parsePreferencesCookie(
      encodeURIComponent(serializePreferences(prefs)),
    );
    assert.deepEqual(roundTripped, prefs);
    assert.equal(roundTripped.currency, "USD");
  });
});
