import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { uniqueCountryMarkets } from "@/lib/i18n/hostinger-locale-markets";
import { resolveCountryDisplayCurrency } from "@/lib/i18n/country-currency";
import {
  STOREFRONT_COUNTRIES,
  STOREFRONT_COUNTRY_CODES,
  assertNoObsoleteStorefrontCountries,
  searchStorefrontCountries,
} from "@/lib/i18n/storefront-countries";

describe("storefront country registry", () => {
  it("is exactly the requested 14 countries with USA included", () => {
    assert.deepEqual(
      STOREFRONT_COUNTRIES.map((c) => c.name),
      [
        "Australia",
        "Bangladesh",
        "Brazil",
        "Canada",
        "China",
        "France",
        "Germany",
        "India",
        "Japan",
        "Nepal",
        "Russia",
        "Spain",
        "United Kingdom",
        "United States",
      ],
    );
    assert.equal(STOREFRONT_COUNTRY_CODES.length, 14);
    assert.ok(STOREFRONT_COUNTRY_CODES.includes("US"));
  });

  it("does not include obsolete or language-only countries", () => {
    const codes = STOREFRONT_COUNTRIES.map((c) => c.code);
    assertNoObsoleteStorefrontCountries(codes);
    assert.equal(codes.includes("KR"), false);
    assert.equal(codes.includes("ID"), false);
    assert.equal(codes.includes("AR"), false);
  });

  it("is the same list the selector unique-country helper uses", () => {
    const selector = uniqueCountryMarkets()
      .map((m) => m.countryCode)
      .sort();
    assert.deepEqual(selector, [...STOREFRONT_COUNTRY_CODES].sort());
    assert.equal(uniqueCountryMarkets().length, 14);
  });

  it("searches by country name and code, not by language", () => {
    assert.ok(searchStorefrontCountries("nepal").some((c) => c.code === "NP"));
    assert.ok(searchStorefrontCountries("gb").some((c) => c.code === "GB"));
    assert.equal(
      searchStorefrontCountries("हिन्दी").some((c) => c.code === "IN"),
      false,
    );
    assert.equal(
      searchStorefrontCountries("français").some((c) => c.code === "CA"),
      false,
    );
    assert.equal(searchStorefrontCountries("zzzz").length, 0);
    assert.equal(
      searchStorefrontCountries("").length,
      STOREFRONT_COUNTRIES.length,
    );
  });

  it("keeps a display-currency mapping for every storefront country", () => {
    for (const country of STOREFRONT_COUNTRIES) {
      const resolved = resolveCountryDisplayCurrency(country.code);
      assert.ok(resolved.currency, country.code);
    }
  });
});
