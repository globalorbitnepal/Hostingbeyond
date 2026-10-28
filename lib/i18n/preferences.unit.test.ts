import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  defaultPreferences,
  normalizePreferences,
  parsePreferencesCookie,
} from "@/lib/i18n/preferences";

describe("locale preference parsing", () => {
  it("defaults to English (US) and USD", () => {
    const prefs = parsePreferencesCookie(undefined);
    assert.equal(prefs.language, "en");
    assert.equal(prefs.country, defaultPreferences.country);
    assert.equal(prefs.currency, "USD");
    assert.equal(prefs.googleTargetLang, "en");
  });

  it("keeps display currency independent of market", () => {
    const prefs = normalizePreferences({
      localeMarketId: "IN-en",
      language: "en",
      currency: "USD",
    });
    assert.equal(prefs.localeMarketId, "IN-en");
    assert.equal(prefs.language, "en");
    assert.equal(prefs.currency, "USD");
  });

  it("maps leftover Hindi prefs back to English", () => {
    const prefs = normalizePreferences({
      localeMarketId: "IN-hi",
      language: "hi",
      googleTargetLang: "hi",
      currency: "INR",
    });
    assert.equal(prefs.language, "en");
    assert.equal(prefs.googleTargetLang, "en");
    assert.equal(prefs.localeMarketId, "IN-en");
    assert.equal(prefs.currency, "INR");
  });

  it("rejects unknown display currencies instead of inventing them", () => {
    const prefs = normalizePreferences({ currency: "EUR" as never });
    assert.equal(prefs.currency, "USD");
  });

  it("returns defaults for malformed cookies", () => {
    const prefs = parsePreferencesCookie("{not-json");
    assert.deepEqual(prefs, defaultPreferences);
  });
});
