import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  preferencesKeepingCurrencyForLanguage,
  storefrontFromWebsiteLanguage,
} from "@/lib/i18n/language-market";
import { normalizePreferences } from "@/lib/i18n/preferences";

describe("storefrontFromWebsiteLanguage", () => {
  it("maps Hindi chip metadata to India (does not apply prices on language pick)", () => {
    const hi = storefrontFromWebsiteLanguage("hi");
    assert.equal(hi.country, "IN");
    assert.equal(hi.googleTargetLang, "hi");
    assert.equal(hi.triggerCode, "HI");
  });

  it("maps Portuguese to Portugal, never Brazil / BRL", () => {
    const pt = storefrontFromWebsiteLanguage("pt");
    assert.equal(pt.country, "PT");
    assert.notEqual(pt.currency, "BRL");
    assert.equal(pt.googleTargetLang, "pt");
    assert.equal(pt.triggerCode, "PT");
  });

  it("maps English chip metadata to United States", () => {
    const en = storefrontFromWebsiteLanguage("en");
    assert.equal(en.country, "US");
    assert.equal(en.googleTargetLang, "en");
  });
});

describe("preferencesKeepingCurrencyForLanguage", () => {
  it("keeps USD when the visitor switches to Portuguese", () => {
    const before = normalizePreferences({
      country: "US",
      localeMarketId: "US-en",
      currency: "USD",
      currencyLocked: true,
      googleTargetLang: "en",
    });
    const next = normalizePreferences({
      ...before,
      ...preferencesKeepingCurrencyForLanguage(before, "pt"),
    });
    assert.equal(next.googleTargetLang, "pt");
    assert.equal(next.currency, "USD");
    assert.equal(next.country, "US");
  });

  it("keeps INR when the visitor switches to Portuguese", () => {
    const before = normalizePreferences({
      country: "IN",
      localeMarketId: "IN-hi",
      currency: "INR",
      currencyLocked: true,
      googleTargetLang: "hi",
    });
    const next = normalizePreferences({
      ...before,
      ...preferencesKeepingCurrencyForLanguage(before, "pt"),
    });
    assert.equal(next.googleTargetLang, "pt");
    assert.equal(next.currency, "INR");
    assert.notEqual(next.currency, "BRL");
  });
});
