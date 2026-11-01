import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  resolveUiCopyLanguage,
  usesNativeStorefrontCopy,
} from "@/lib/i18n/ui-copy-language";
import { normalizePreferences } from "@/lib/i18n/preferences";
import { buildCheckoutNote } from "@/lib/payments/checkout-currency";
import { getDictionary } from "@/lib/i18n/dictionaries";

describe("ui copy language", () => {
  it("uses Nepali dictionary for NP-ne market", () => {
    const prefs = normalizePreferences({
      localeMarketId: "NP-ne",
      googleTargetLang: "ne",
      country: "NP",
      language: "en",
    });
    assert.equal(resolveUiCopyLanguage(prefs), "ne");
    assert.equal(usesNativeStorefrontCopy("ne"), true);
    /** NPR is not a provider-settlement currency, so the note falls back. */
    const note = buildCheckoutNote(
      getDictionary(resolveUiCopyLanguage(prefs)).common,
      "NPR",
    );
    assert.match(note, /NPR/);
    assert.match(note, /USD/);
    assert.doesNotMatch(note, /^Prices in NPR/);

    /** EUR is settleable, so the note charges in EUR. */
    const eur = buildCheckoutNote(
      getDictionary(resolveUiCopyLanguage(prefs)).common,
      "EUR",
    );
    assert.match(eur, /EUR/);
    assert.doesNotMatch(eur, /USD/);
  });

  it("uses Spanish checkout copy for ES market while cloud translate may run", () => {
    const prefs = normalizePreferences({
      localeMarketId: "ES-es",
      googleTargetLang: "es",
      country: "ES",
    });
    assert.equal(resolveUiCopyLanguage(prefs), "es");
    const note = buildCheckoutNote(
      getDictionary(resolveUiCopyLanguage(prefs)).common,
      "EUR",
    );
    assert.match(note, /EUR/);
    assert.doesNotMatch(note, /^Prices in EUR/);
  });
});
