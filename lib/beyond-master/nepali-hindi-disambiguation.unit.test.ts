import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { detectMessageLocale } from "@/lib/beyond-master/locale";
import { agentCopyForLocale } from "@/lib/beyond-master/replies";

/**
 * Live HTTP probing of /api/beyond-master/chat showed a Devanagari Nepali
 * question ("बिजनेस इमेल के हो?") answered with Hindi copy. Hindi and Nepali
 * share the Devanagari script, so detection must not default to Hindi when the
 * sentence uses Nepali grammar/particles.
 */
describe("Devanagari Hindi vs Nepali disambiguation", () => {
  it("detects the Nepali copula question as Nepali", () => {
    assert.equal(detectMessageLocale("बिजनेस इमेल के हो?"), "ne");
    assert.equal(detectMessageLocale("डोमेनको मूल्य कति हुन्छ?"), "ne");
    assert.equal(detectMessageLocale("होस्टिङ कसरी किन्ने?"), "ne");
  });

  it("still detects genuine Hindi as Hindi", () => {
    assert.equal(detectMessageLocale("बिजनेस ईमेल क्या है?"), "hi");
    assert.equal(detectMessageLocale("डोमेन की कीमत क्या है?"), "hi");
    assert.equal(detectMessageLocale("मुझे होस्टिंग चाहिए"), "hi");
  });

  it("routes each script variant to distinct reply copy", () => {
    const ne = agentCopyForLocale("ne");
    const hi = agentCopyForLocale("hi");
    assert.notEqual(ne, hi);
  });
});
