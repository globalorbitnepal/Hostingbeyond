import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isNonEnglishWebsiteLanguage,
  pickStorefrontTranslationBackend,
  shouldUseCloudDomTranslation,
  shouldUseGoogleWebsiteTranslator,
} from "@/lib/i18n/storefront-translation";

describe("storefront translation routing", () => {
  it("routes native Nepali to cloud DOM, not the website widget", () => {
    assert.equal(shouldUseGoogleWebsiteTranslator("ne"), false);
    assert.equal(shouldUseCloudDomTranslation("ne"), true);
    assert.equal(pickStorefrontTranslationBackend("ne", true), "cloud");
  });

  it("routes German to cloud when available, otherwise the website widget", () => {
    assert.equal(shouldUseGoogleWebsiteTranslator("de"), true);
    assert.equal(pickStorefrontTranslationBackend("de", true), "cloud");
    assert.equal(pickStorefrontTranslationBackend("de", false), "widget");
  });

  it("treats English as no translation", () => {
    assert.equal(isNonEnglishWebsiteLanguage("en"), false);
    assert.equal(pickStorefrontTranslationBackend("en", true), "none");
  });
});
