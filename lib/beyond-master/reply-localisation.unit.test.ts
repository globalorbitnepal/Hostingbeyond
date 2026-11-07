import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { agentCopyForLocale } from "@/lib/beyond-master/replies";

/**
 * Live HTTP probing showed grounded answers falling back to English for
 * fr/de/ru because those Copy objects only overrode a few keys via `...EN`.
 * Every advertised locale must localise the customer-visible service answers.
 */
describe("grounded copy localisation coverage", () => {
  const locales = [
    "en",
    "hi",
    "ne",
    "es",
    "fr",
    "de",
    "ru",
    "ar",
    "bn",
  ] as const;
  const english = agentCopyForLocale("en");

  for (const locale of locales) {
    if (locale === "en") continue;
    it(`localises customer-facing answers for ${locale}`, () => {
      const copy = agentCopyForLocale(locale);
      assert.notEqual(copy.email, english.email, `${locale} email copy`);
      assert.notEqual(copy.dns, english.dns, `${locale} dns copy`);
      assert.notEqual(copy.ssl, english.ssl, `${locale} ssl copy`);
      assert.notEqual(
        copy.greeting(),
        english.greeting(),
        `${locale} greeting`,
      );
      assert.notEqual(
        copy.fallback(),
        english.fallback(),
        `${locale} fallback`,
      );
    });
  }

  it("keeps URLs and product names intact in translated copy", () => {
    for (const locale of locales) {
      const copy = agentCopyForLocale(locale);
      assert.match(copy.email, /\/business-email/, `${locale} keeps path`);
      assert.match(copy.website, /\/web-hosting/, `${locale} keeps path`);
    }
  });
});
