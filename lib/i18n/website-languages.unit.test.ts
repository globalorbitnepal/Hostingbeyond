import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_WEBSITE_LANGUAGE_CODE,
  WEBSITE_LANGUAGES,
  googleTranslateIncludedLanguages,
  isStorefrontWebsiteLanguage,
  isTranslationTargetAllowed,
  normalizeEnabledLanguageCodes,
  resolveWebsiteLanguageCode,
  translationTargetCodes,
  withEnabledWebsiteLanguages,
} from "@/lib/i18n/website-languages";

describe("website language registry", () => {
  it("registers each language once with English first and Portuguese as Portugal", () => {
    const codes = WEBSITE_LANGUAGES.map((row) => row.code);
    assert.equal(new Set(codes).size, codes.length);
    assert.deepEqual(codes.slice(0, 3), ["en", "hi", "ne"]);
    assert.ok(codes.includes("it"));
    assert.ok(codes.includes("pt"));
    assert.equal(
      WEBSITE_LANGUAGES.find((row) => row.code === "pt")?.flagCountryCode,
      "PT",
    );
    assert.equal(WEBSITE_LANGUAGES[0]?.isDefault, true);
    assert.equal(DEFAULT_WEBSITE_LANGUAGE_CODE, "en");
  });

  it("keeps storefront language flags inside the 14-country list", () => {
    assert.equal(isStorefrontWebsiteLanguage({ flagCountryCode: "US" }), true);
    assert.equal(isStorefrontWebsiteLanguage({ flagCountryCode: "IN" }), true);
    assert.equal(isStorefrontWebsiteLanguage({ flagCountryCode: "KR" }), false);
    assert.equal(isStorefrontWebsiteLanguage({ flagCountryCode: "ID" }), false);
  });

  it("maps each language to a display flag (English defaults to US)", () => {
    assert.equal(
      WEBSITE_LANGUAGES.find((r) => r.code === "en")?.flagCountryCode,
      "US",
    );
    for (const row of WEBSITE_LANGUAGES) {
      assert.match(row.flagCountryCode, /^[A-Z]{2}$/);
    }
  });

  it("keeps English enabled and drops unknown codes", () => {
    assert.deepEqual(normalizeEnabledLanguageCodes(["hi", "xx", "ko"]), [
      "en",
      "hi",
      "ko",
    ]);
    assert.equal(
      normalizeEnabledLanguageCodes(undefined).length,
      WEBSITE_LANGUAGES.length,
    );
    assert.ok(
      normalizeEnabledLanguageCodes([
        "en",
        "bn",
        "pt",
        "fr",
        "zh-CN",
        "de",
        "hi",
        "ja",
        "ne",
        "ru",
        "es",
        "ko",
        "id",
      ]).includes("it"),
    );
  });

  it("falls back to English for disabled or invalid targets", () => {
    assert.equal(resolveWebsiteLanguageCode("hi", ["en", "es"]), "en");
    assert.equal(resolveWebsiteLanguageCode("id", ["en", "id"]), "id");
    assert.equal(resolveWebsiteLanguageCode("nope"), "en");
  });

  it("exposes Cloud Translation targets including ko and id", () => {
    const targets = translationTargetCodes();
    assert.equal(targets.includes("en"), false);
    assert.ok(targets.includes("ko"));
    assert.ok(targets.includes("id"));
    assert.ok(targets.includes("zh-CN"));
    assert.ok(googleTranslateIncludedLanguages().includes("ko"));
  });

  it("rejects disabled languages and English as translation targets", () => {
    assert.equal(isTranslationTargetAllowed("hi", ["en", "ja"]), false);
    assert.equal(isTranslationTargetAllowed("en", ["en", "hi"]), false);
    assert.equal(isTranslationTargetAllowed("id", ["en", "id"]), true);
  });

  it("cannot disable English through SiteSettings merge", () => {
    const saved = withEnabledWebsiteLanguages(
      { websiteLanguageEnabledCodes: ["en", "hi"] },
      ["hi", "ko"],
    );
    assert.ok(saved.websiteLanguageEnabledCodes.includes("en"));
    assert.deepEqual(saved.websiteLanguageEnabledCodes, ["en", "hi", "ko"]);
  });
});
