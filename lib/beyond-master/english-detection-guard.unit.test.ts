import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { detectMessageLocale } from "@/lib/beyond-master/locale";

/**
 * Live HTTP probing of /api/beyond-master/chat returned a French answer for the
 * plain English question "What is business email?" — the French marker list
 * contained the English words "email" and "aide", and a foreign match beat
 * English. English must win ties, and shared English words must not be treated
 * as foreign signals.
 */
describe("English is not overridden by shared Latin markers", () => {
  const englishPrompts = [
    "What is business email?",
    "Do you offer business email?",
    "What services do you offer?",
    "How much does a .com domain cost?",
    "What web hosting plans do you have?",
    "Do you provide SSL certificates?",
    "My website is showing a 500 error, what should I check?",
    "I need to talk to a human support agent",
  ];

  for (const prompt of englishPrompts) {
    it(`keeps "${prompt}" in English`, () => {
      assert.equal(detectMessageLocale(prompt), "en");
    });
  }

  it("still detects clearly French and German sentences", () => {
    assert.equal(
      detectMessageLocale("Qu'est-ce que l'e-mail professionnel ?"),
      "fr",
    );
    assert.equal(detectMessageLocale("Je veux un nom de domaine"), "fr");
    assert.equal(detectMessageLocale("Was ist geschäftliches E-Mail?"), "de");
    assert.equal(detectMessageLocale("Ich brauche Webhosting"), "de");
  });
});
