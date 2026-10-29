import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GOOGLE_PAGE_LANGUAGE,
  googtransCookieValue,
  googleTranslateElementOptions,
  isGoogleTranslationActive,
} from "@/lib/i18n/google-translate-client";

describe("Google Website Translator helpers", () => {
  it("builds googtrans cookie values Google Translate expects", () => {
    assert.equal(googtransCookieValue("en"), "/en/en");
    assert.equal(googtransCookieValue("de"), "/en/de");
    assert.equal(googtransCookieValue("zh-CN"), "/en/zh-CN");
    assert.equal(
      googtransCookieValue("  "),
      `/${GOOGLE_PAGE_LANGUAGE}/${GOOGLE_PAGE_LANGUAGE}`,
    );
  });

  it("treats only non-English targets as active translation", () => {
    assert.equal(isGoogleTranslationActive("en"), false);
    assert.equal(isGoogleTranslationActive("de"), true);
    assert.equal(isGoogleTranslationActive("zh-CN"), true);
    assert.equal(isGoogleTranslationActive(""), false);
  });

  it("includes every storefront language in the widget allow-list", () => {
    const options = googleTranslateElementOptions();
    assert.equal(options.pageLanguage, "en");
    assert.match(String(options.includedLanguages), /de/);
    assert.match(String(options.includedLanguages), /hi/);
    assert.match(String(options.includedLanguages), /zh-CN/);
    assert.match(String(options.includedLanguages), /ko/);
    assert.match(String(options.includedLanguages), /id/);
  });
});
