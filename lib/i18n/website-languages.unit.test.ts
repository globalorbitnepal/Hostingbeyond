import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_WEBSITE_LANGUAGE_CODE,
  WEBSITE_LANGUAGES,
  googleTranslateIncludedLanguages,
  isTranslationTargetAllowed,
  normalizeEnabledLanguageCodes,
  resolveWebsiteLanguageCode,
  translationTargetCodes,
  withEnabledWebsiteLanguages,
} from "@/lib/i18n/website-languages";

describe("website language registry", () => {
  it("registers exactly the 13 required languages once", () => {
    const codes = WEBSITE_LANGUAGES.map((row) => row.code);
    assert.equal(codes.length, 13);
    assert.equal(new Set(codes).size, 13);
    assert.deepEqual(codes, [
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
    ]);
    assert.equal(WEBSITE_LANGUAGES[0]?.isDefault, true);
    assert.equal(DEFAULT_WEBSITE_LANGUAGE_CODE, "en");
  });

  it("keeps English enabled and drops unknown codes", () => {
    assert.deepEqual(normalizeEnabledLanguageCodes(["hi", "xx", "ko"]), [
      "en",
      "hi",
      "ko",
    ]);
    assert.equal(normalizeEnabledLanguageCodes(undefined).length, 13);
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
