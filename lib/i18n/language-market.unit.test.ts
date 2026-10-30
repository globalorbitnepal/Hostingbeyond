import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  preferencesFromWebsiteLanguage,
  storefrontFromWebsiteLanguage,
} from "@/lib/i18n/language-market";
import { normalizePreferences } from "@/lib/i18n/preferences";
import { WEBSITE_LANGUAGES } from "@/lib/i18n/website-languages";

const LANGUAGE_CURRENCY: Record<string, { country: string; currency: string }> =
  {
    en: { country: "US", currency: "USD" },
    hi: { country: "IN", currency: "INR" },
    ne: { country: "NP", currency: "NPR" },
    bn: { country: "BD", currency: "BDT" },
    fr: { country: "FR", currency: "EUR" },
    de: { country: "DE", currency: "EUR" },
    id: { country: "ID", currency: "IDR" },
    it: { country: "IT", currency: "EUR" },
    ja: { country: "JP", currency: "JPY" },
    ko: { country: "KR", currency: "KRW" },
    pt: { country: "PT", currency: "EUR" },
    ru: { country: "RU", currency: "RUB" },
    "zh-CN": { country: "CN", currency: "CNY" },
    es: { country: "ES", currency: "EUR" },
  };

describe("storefrontFromWebsiteLanguage", () => {
  it("maps every website language to the correct country and currency", () => {
    assert.equal(
      Object.keys(LANGUAGE_CURRENCY).length,
      WEBSITE_LANGUAGES.length,
    );
    for (const row of WEBSITE_LANGUAGES) {
      const expected = LANGUAGE_CURRENCY[row.code];
      const got = storefrontFromWebsiteLanguage(row.code);
      assert.equal(got.country, expected.country, row.code);
      assert.equal(got.currency, expected.currency, row.code);
      assert.equal(got.googleTargetLang, row.code);
    }
  });

  it("maps Portuguese to Portugal / EUR, never Brazil / BRL", () => {
    const pt = storefrontFromWebsiteLanguage("pt");
    assert.equal(pt.country, "PT");
    assert.equal(pt.currency, "EUR");
    assert.notEqual(pt.currency, "BRL");
    assert.notEqual(pt.currency, "AUD");
  });
});

describe("preferencesFromWebsiteLanguage", () => {
  it("replaces leftover AUD with EUR when switching to Portuguese", () => {
    const before = normalizePreferences({
      country: "AU",
      localeMarketId: "AU-en",
      currency: "AUD",
      currencyLocked: true,
      googleTargetLang: "en",
    });
    const next = normalizePreferences(
      preferencesFromWebsiteLanguage(before, "pt"),
    );
    assert.equal(next.googleTargetLang, "pt");
    assert.equal(next.country, "PT");
    assert.equal(next.currency, "EUR");
    assert.notEqual(next.currency, "AUD");
    assert.notEqual(next.currency, "BRL");
  });

  it("maps Hindi to INR even if the previous currency was locked", () => {
    const before = normalizePreferences({
      country: "US",
      localeMarketId: "US-en",
      currency: "USD",
      currencyLocked: true,
      googleTargetLang: "en",
    });
    const next = normalizePreferences(
      preferencesFromWebsiteLanguage(before, "hi"),
    );
    assert.equal(next.googleTargetLang, "hi");
    assert.equal(next.currency, "INR");
  });
});
