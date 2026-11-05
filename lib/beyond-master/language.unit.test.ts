import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  detectAgentLanguage,
  resolveConversationLanguage,
} from "@/lib/beyond-master/language";
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

  it("keeps Hindi questions out of the Nepali branch", () => {
    assert.equal(detectAgentLanguage("invoice कहाँ देखूँ?"), "hi");
    assert.equal(detectAgentLanguage("वेब होस्टिंग कैसे खरीदूँ?"), "hi");
    assert.equal(detectAgentLanguage("बिलिंग कहाँ है?"), "hi");
  });

  it("keeps Nepali questions out of the Hindi branch", () => {
    assert.equal(detectAgentLanguage("इनभ्वाइस कहाँ हेर्ने?"), "ne");
    assert.equal(detectAgentLanguage("होस्टिङ कसरी किन्ने?"), "ne");
  });

  it("detects romanised Hindi and Nepali", () => {
    assert.equal(detectAgentLanguage("hosting ka price kya hai"), "hi");
    assert.equal(detectAgentLanguage("domain ko price kati huncha"), "ne");
  });

  it("defaults to English", () => {
    assert.equal(detectAgentLanguage("How much is web hosting?"), "en");
  });

  it("detects Hinglish domain and hosting phrases", () => {
    assert.equal(
      detectAgentLanguage("Mujhe apni website ke liye hosting chahiye."),
      "hi",
    );
    assert.equal(
      detectAgentLanguage("Mero domain connect nahi ho raha, please help."),
      "ne",
    );
  });

  it("tracks conversation language across switches", () => {
    const messages = [
      { role: "user" as const, content: "I want to register a domain." },
      { role: "assistant" as const, content: "Which name?" },
      {
        role: "user" as const,
        content: "मुझे होस्टिंग चाहिए",
      },
    ];
    assert.equal(resolveConversationLanguage(messages), "hi");
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
