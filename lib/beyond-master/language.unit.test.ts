import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { detectAgentLanguage } from "@/lib/beyond-master/language";
import {
  isAgentGreeting,
  wantsBulkDomainSearch,
} from "@/lib/beyond-master/domain-intent";

describe("agent language detection", () => {
  it("detects Hindi and Nepali Devanagari separately", () => {
    assert.equal(detectAgentLanguage("डोमेन की कीमत क्या है?"), "hi");
    assert.equal(detectAgentLanguage("डोमेनको मूल्य कति हुन्छ?"), "ne");
    assert.equal(detectAgentLanguage("मुझे होस्टिंग चाहिए"), "hi");
  });

  it("detects romanised Hindi and Nepali", () => {
    assert.equal(detectAgentLanguage("hosting ka price kya hai"), "hi");
    assert.equal(detectAgentLanguage("domain ko price kati huncha"), "ne");
  });

  it("defaults to English", () => {
    assert.equal(detectAgentLanguage("How much is web hosting?"), "en");
  });

  it("recognises Nepali and Hindi greetings", () => {
    assert.equal(isAgentGreeting("नमस्ते"), true);
    assert.equal(isAgentGreeting("नमस्कार"), true);
    assert.equal(isAgentGreeting("namaskar"), true);
    assert.equal(isAgentGreeting("hello there, I need a domain"), false);
  });

  it("recognises bulk search in Hindi and Nepali", () => {
    assert.equal(wantsBulkDomainSearch("bulk domain search"), true);
    assert.equal(wantsBulkDomainSearch("मुझे बल्क सर्च चाहिए"), true);
    assert.equal(wantsBulkDomainSearch("धेरै डोमेन जाँच्न"), true);
  });
});
