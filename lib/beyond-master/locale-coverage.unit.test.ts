import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  detectMessageLocale,
  normalizeBcp47Locale,
  primaryLanguageSubtag,
  resolveConversationLocale,
} from "@/lib/beyond-master/locale";

/**
 * Local-only language checks (no provider call). Confirms the BCP-47 surface
 * covers every language the support matrix promises, so a missing tag would be
 * caught here rather than by silently answering in English.
 */
describe("supported locale coverage", () => {
  it("maps the required primary subtags", () => {
    const cases: Array<[string, string]> = [
      ["en", "en"],
      ["hi", "hi"],
      ["hi-Latn", "hi"],
      ["ne", "ne"],
      ["ar", "ar"],
      ["es", "es"],
      ["fr", "fr"],
      ["de", "de"],
      ["ru", "ru"],
    ];
    for (const [locale, expected] of cases) {
      assert.equal(primaryLanguageSubtag(locale), expected, locale);
    }
  });

  it("normalises regional and script variants without dropping the region", () => {
    // `normalizeBcp47Locale` is a lowercasing validator, not a reducer:
    // downstream code uses `primaryLanguageSubtag` to collapse the region.
    assert.equal(normalizeBcp47Locale("hi-IN"), "hi-in");
    assert.equal(normalizeBcp47Locale("ne-NP"), "ne-np");
    assert.equal(normalizeBcp47Locale("ar-EG"), "ar-eg");
    assert.equal(normalizeBcp47Locale("ru-RU"), "ru-ru");
    assert.equal(primaryLanguageSubtag("hi-IN"), "hi");
    assert.equal(primaryLanguageSubtag("ne-NP"), "ne");
  });

  it("detects non-Latin scripts and Latin-script languages", () => {
    assert.equal(detectMessageLocale("مرحبا، أحتاج إلى استضافة"), "ar");
    assert.equal(detectMessageLocale("Мне нужен хостинг"), "ru");
    assert.equal(detectMessageLocale("Je veux un nom de domaine"), "fr");
    assert.equal(detectMessageLocale("Ich brauche Webhosting"), "de");
  });

  it("keeps Latin American Spanish and Hinglish distinct", () => {
    assert.equal(
      detectMessageLocale("Necesito un dominio para mi tienda"),
      "es",
    );
    assert.equal(detectMessageLocale("Mujhe domain chahiye"), "hi-Latn");
  });

  it("falls back to English for unrelated text", () => {
    assert.equal(detectMessageLocale("where is my invoice"), "en");
    assert.equal(normalizeBcp47Locale(null), null);
    assert.equal(resolveConversationLocale([], null), "en");
  });
});
