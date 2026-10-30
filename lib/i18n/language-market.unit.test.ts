import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { storefrontFromWebsiteLanguage } from "@/lib/i18n/language-market";

describe("storefrontFromWebsiteLanguage", () => {
  it("maps Hindi to India and INR", () => {
    const hi = storefrontFromWebsiteLanguage("hi");
    assert.equal(hi.country, "IN");
    assert.equal(hi.currency, "INR");
    assert.equal(hi.googleTargetLang, "hi");
    assert.equal(hi.triggerCode, "HI");
    assert.equal(hi.localeMarketId, "IN-hi");
  });

  it("maps Nepali to Nepal and NPR", () => {
    const ne = storefrontFromWebsiteLanguage("ne");
    assert.equal(ne.country, "NP");
    assert.equal(ne.currency, "NPR");
    assert.equal(ne.googleTargetLang, "ne");
  });

  it("maps English to United States and USD", () => {
    const en = storefrontFromWebsiteLanguage("en");
    assert.equal(en.country, "US");
    assert.equal(en.currency, "USD");
    assert.equal(en.googleTargetLang, "en");
  });

  it("maps German to Germany and EUR", () => {
    const de = storefrontFromWebsiteLanguage("de");
    assert.equal(de.country, "DE");
    assert.equal(de.currency, "EUR");
  });
});
