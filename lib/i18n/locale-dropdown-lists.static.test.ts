import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { usdToLocalRate } from "@/config/pricing";
import {
  FEATURED_DISPLAY_CURRENCIES,
  orderedPublicDisplayCurrencies,
  PUBLIC_DISPLAY_CURRENCY_LABELS,
} from "@/lib/i18n/display-currencies";
import { WEBSITE_LANGUAGES } from "@/lib/i18n/website-languages";

describe("website language list", () => {
  it("has unique codes, unique trigger labels, and English first", () => {
    const codes = WEBSITE_LANGUAGES.map((row) => row.code);
    assert.equal(new Set(codes).size, codes.length);
    assert.equal(codes[0], "en");
    const triggers = WEBSITE_LANGUAGES.map((row) => row.triggerCode);
    assert.equal(new Set(triggers).size, triggers.length);
  });

  it("does not treat Portuguese as Brazil / BRL", () => {
    const pt = WEBSITE_LANGUAGES.find((row) => row.code === "pt");
    assert.ok(pt);
    assert.equal(pt.flagCountryCode, "PT");
    assert.notEqual(pt.flagCountryCode, "BR");
    assert.equal(pt.triggerCode, "PT");
  });

  it("covers the geo languages that are LTR plus Nepali, Bengali, Indonesian, Chinese", () => {
    const codes = new Set(WEBSITE_LANGUAGES.map((row) => row.code));
    for (const code of [
      "en",
      "hi",
      "ne",
      "bn",
      "fr",
      "de",
      "it",
      "pt",
      "es",
      "ja",
      "ko",
      "zh-CN",
      "id",
      "ru",
    ]) {
      assert.ok(codes.has(code as (typeof WEBSITE_LANGUAGES)[number]["code"]));
    }
  });

  it("uses a two-letter flag for every row", () => {
    for (const row of WEBSITE_LANGUAGES) {
      assert.match(row.flagCountryCode, /^[A-Z]{2}$/);
      assert.ok(row.englishName.length > 0);
      assert.ok(row.nativeName.length > 0);
    }
  });
});

describe("display currency list", () => {
  it("offers every configured positive FX rate once", () => {
    const ordered = orderedPublicDisplayCurrencies();
    assert.equal(new Set(ordered).size, ordered.length);
    for (const [code, rate] of Object.entries(usdToLocalRate)) {
      if (Number.isFinite(rate) && rate > 0) {
        assert.ok(ordered.includes(code as (typeof ordered)[number]), code);
        assert.equal(PUBLIC_DISPLAY_CURRENCY_LABELS[code as never].code, code);
      }
    }
  });

  it("features USD, INR, NPR, EUR first and still includes BRL as a currency not a language", () => {
    const ordered = orderedPublicDisplayCurrencies();
    assert.deepEqual(
      [...FEATURED_DISPLAY_CURRENCIES],
      ["USD", "INR", "NPR", "EUR"],
    );
    assert.deepEqual(ordered.slice(0, 4), ["USD", "INR", "NPR", "EUR"]);
    assert.ok(ordered.includes("BRL"));
    assert.ok(ordered.indexOf("BRL") > 3);
  });
});
