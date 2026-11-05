import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  detectMessageLocale,
  normalizeBcp47Locale,
  resolveConversationLocale,
} from "@/lib/beyond-master/locale";
import { localizedProviderError } from "@/lib/beyond-master/messages/provider-errors";
import { BeyondMasterProviderError } from "@/lib/beyond-master/providers/stream";

describe("BCP-47 locale detection", () => {
  it("detects English, Hindi, Hinglish, and Nepali", () => {
    assert.equal(detectMessageLocale("How much is web hosting?"), "en");
    assert.equal(detectMessageLocale("डोमेन की कीमत क्या है?"), "hi");
    assert.equal(detectMessageLocale("hosting ka price kya hai"), "hi-Latn");
    assert.equal(detectMessageLocale("domain ko price kati huncha"), "ne");
    assert.equal(detectMessageLocale("डोमेनको मूल्य कति हुन्छ?"), "ne");
  });

  it("detects Spanish, French, Arabic, and Bengali", () => {
    assert.equal(
      detectMessageLocale("Necesito un correo profesional para mi empresa."),
      "es",
    );
    assert.equal(
      detectMessageLocale("Quel est le prix de l'hébergement ?"),
      "fr",
    );
    assert.equal(detectMessageLocale("أريد ربط النطاق بالاستضافة"), "ar");
    assert.equal(
      detectMessageLocale("আমার ডোমেইনটি হোস্টিংয়ের সাথে যুক্ত করতে চাই।"),
      "bn",
    );
  });

  it("handles mixed-language requests with dominant locale", () => {
    assert.equal(
      detectMessageLocale("Hola, quiero hosting para mi tienda example.com"),
      "es",
    );
    assert.equal(
      detectMessageLocale("Please help mujhe hosting chahiye for my shop"),
      "hi-Latn",
    );
  });

  it("normalizes and resolves conversation locale with preference", () => {
    assert.equal(normalizeBcp47Locale("ES"), "es");
    assert.equal(normalizeBcp47Locale("bad locale!!!"), null);
    const locale = resolveConversationLocale(
      [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
        { role: "user", content: "Quiero ver mis dominios" },
      ],
      "en",
    );
    assert.equal(locale, "es");
  });

  it("returns localized provider errors without English-only lock-in", () => {
    const err = new BeyondMasterProviderError("rate_limited", "quota");
    assert.match(localizedProviderError(err, "es"), /límite/i);
    assert.match(localizedProviderError(err, "fr"), /limite/i);
    assert.match(localizedProviderError(err, "ar"), /حد/);
    assert.match(localizedProviderError(err, "bn"), /সীমা/);
    assert.match(localizedProviderError(err, "de"), /usage limit/i);
  });
});
