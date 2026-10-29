import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  effectiveMarket,
  getLocaleMarket,
  isMarketLanguageEnabled,
  publicLocaleMarkets,
  searchLocaleMarkets,
} from "@/lib/i18n/hostinger-locale-markets";

describe("public locale markets", () => {
  it("offers every country named in the product brief", () => {
    const codes = publicLocaleMarkets().map((m) => m.countryCode);
    const required = [
      "NP", // Nepal
      "US", // United States
      "GB", // United Kingdom
      "IN", // India
      "AU", // Australia
      "CA", // Canada
      "DE", // Germany
      "FR", // France
      "ES", // Spain
      "RU", // Russia
      "CN", // China
      "JP", // Japan
      "BD", // Bangladesh
      "BR", // Brazil
    ];
    for (const code of required) {
      assert.ok(codes.includes(code), `${code} must be selectable`);
    }
  });

  it("keeps country availability independent of language availability", () => {
    /** A German market must exist even though public copy is English-only. */
    const de = publicLocaleMarkets().filter((m) => m.countryCode === "DE");
    assert.ok(de.length > 0);
    assert.equal(de[0].languageLabel, "Deutsch");

    /** ...but its language is not applied while the policy is English-only. */
    assert.equal(isMarketLanguageEnabled(de[0]), false);
    const applied = effectiveMarket(de[0]);
    assert.equal(applied.countryCode, "DE");
    assert.equal(applied.googleTargetLang, "en");
    assert.equal(applied.triggerCode, "EN");
  });

  it("preserves the country when resolving a non-English market", () => {
    const market = getLocaleMarket("FR-fr");
    assert.equal(market.countryCode, "FR");
    assert.equal(market.id, "FR-fr");
    assert.equal(market.googleTargetLang, "en");
  });

  it("offers both Canadian language markets", () => {
    const canada = publicLocaleMarkets().filter((m) => m.countryCode === "CA");
    const labels = canada.map((m) => m.languageLabel);
    assert.ok(labels.includes("English"));
    assert.ok(labels.includes("Français"));
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
});
