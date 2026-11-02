import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isNonEnglishWebsiteLanguage,
  pickStorefrontTranslationBackend,
  shouldUseCloudDomTranslation,
  shouldUseGoogleWebsiteTranslator,
} from "@/lib/i18n/storefront-translation";

describe("storefront translation routing", () => {
  it("uses the Google widget for Nepali and Hindi so the full page translates", () => {
    assert.equal(shouldUseGoogleWebsiteTranslator("ne"), true);
    assert.equal(shouldUseGoogleWebsiteTranslator("hi"), true);
    assert.equal(shouldUseCloudDomTranslation("ne"), true);
    assert.equal(pickStorefrontTranslationBackend("ne", true), "widget");
    assert.equal(pickStorefrontTranslationBackend("hi", false), "widget");
  });

  it("uses the Google widget for German even when Cloud is available", () => {
    assert.equal(shouldUseGoogleWebsiteTranslator("de"), true);
    assert.equal(pickStorefrontTranslationBackend("de", true), "widget");
    assert.equal(pickStorefrontTranslationBackend("de", false), "widget");
  });

  it("treats English as no translation", () => {
    assert.equal(isNonEnglishWebsiteLanguage("en"), false);
    assert.equal(pickStorefrontTranslationBackend("en", true), "none");
  });
});
