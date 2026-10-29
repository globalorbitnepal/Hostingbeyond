import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_LOCALE_MARKET_ID,
  effectiveMarket,
  getLocaleMarket,
  googleTranslateIncludedLanguages,
  isMarketLanguageEnabled,
  publicLocaleMarkets,
  searchLocaleMarkets,
  uniqueCountryMarkets,
} from "@/lib/i18n/hostinger-locale-markets";

describe("public locale markets", () => {
  it("offers exactly the curated countries with USA as default", () => {
    const markets = publicLocaleMarkets();
    const codes = [...new Set(markets.map((m) => m.countryCode))];
    assert.deepEqual(codes.sort(), [
      "AU",
      "BD",
      "BR",
      "CA",
      "CN",
      "DE",
      "ES",
      "FR",
      "GB",
      "IN",
      "JP",
      "NP",
      "RU",
      "US",
    ]);
    assert.equal(DEFAULT_LOCALE_MARKET_ID, "US-en");
    assert.equal(getLocaleMarket("US-en").triggerCode, "EN");
    assert.equal(getLocaleMarket("US-en").googleTargetLang, "en");
  });

  it("uses English country names and native language labels", () => {
    const byId = Object.fromEntries(
      publicLocaleMarkets().map((m) => [m.id, m]),
    );
    assert.equal(byId["NP-ne"]?.countryName, "Nepal");
    assert.equal(byId["NP-ne"]?.languageLabel, "नेपाली");
    assert.equal(byId["NP-ne"]?.googleTargetLang, "ne");
    assert.equal(byId["IN-hi"]?.countryName, "India");
    assert.equal(byId["IN-hi"]?.languageLabel, "हिन्दी");
    assert.equal(byId["DE-de"]?.countryName, "Germany");
    assert.equal(byId["DE-de"]?.languageLabel, "Deutsch");
    assert.equal(byId["CN-zh"]?.countryName, "China");
    assert.equal(byId["RU-ru"]?.googleTargetLang, "ru");
    assert.equal(byId["BD-bn"]?.googleTargetLang, "bn");
  });

  it("applies non-English Google targets (not English-only)", () => {
    const de = publicLocaleMarkets().filter((m) => m.countryCode === "DE");
    assert.equal(de[0].languageLabel, "Deutsch");
    assert.equal(isMarketLanguageEnabled(de[0]), true);
    const applied = effectiveMarket(de[0]);
    assert.equal(applied.countryCode, "DE");
    assert.equal(applied.googleTargetLang, "de");
    assert.equal(applied.triggerCode, "DE");
  });

  it("preserves the country when resolving a non-English market", () => {
    const market = getLocaleMarket("FR-fr");
    assert.equal(market.countryCode, "FR");
    assert.equal(market.id, "FR-fr");
    assert.equal(market.googleTargetLang, "fr");
  });

  it("maps legacy Nepal/India cookie ids without dropping the country", () => {
    assert.equal(getLocaleMarket("NP-en").id, "NP-ne");
    assert.equal(getLocaleMarket("IN-en").id, "IN-hi");
  });

  it("offers both Canadian language markets", () => {
    const canada = publicLocaleMarkets().filter((m) => m.countryCode === "CA");
    const labels = canada.map((m) => m.languageLabel);
    assert.ok(labels.includes("English"));
    assert.ok(labels.includes("Français"));
  });

  it("includes every Google target in the translator language list", () => {
    const included = googleTranslateIncludedLanguages();
    for (const market of publicLocaleMarkets()) {
      assert.ok(
        included.split(",").includes(market.googleTargetLang),
        `${market.id} → ${market.googleTargetLang}`,
      );
    }
  });

  it("finds countries by native language name", () => {
    assert.ok(
      searchLocaleMarkets("नेपाली").some((m) => m.countryCode === "NP"),
    );
    assert.ok(
      searchLocaleMarkets("日本語").some((m) => m.countryCode === "JP"),
    );
    assert.ok(
      searchLocaleMarkets("Русский").some((m) => m.countryCode === "RU"),
    );
    assert.ok(searchLocaleMarkets("中文").some((m) => m.countryCode === "CN"));
    assert.ok(
      searchLocaleMarkets("français").some((m) => m.countryCode === "CA"),
    );
  });

  it("finds countries by name and code", () => {
    assert.ok(searchLocaleMarkets("nepal").some((m) => m.countryCode === "NP"));
    assert.ok(searchLocaleMarkets("gb").some((m) => m.countryCode === "GB"));
    assert.ok(
      searchLocaleMarkets("germany").some((m) => m.countryCode === "DE"),
    );
  });

  it("returns every market for an empty query and none for gibberish", () => {
    assert.equal(searchLocaleMarkets("").length, publicLocaleMarkets().length);
    assert.equal(searchLocaleMarkets("zzzzzzz").length, 0);
  });

  it("has unique market ids (React keys / saved cookie ids)", () => {
    const ids = publicLocaleMarkets().map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("lists each country once for country-only selection", () => {
    const countries = uniqueCountryMarkets();
    const codes = countries.map((m) => m.countryCode);
    assert.equal(new Set(codes).size, codes.length);
    assert.equal(countries.filter((m) => m.countryCode === "CA").length, 1);
  });
});
