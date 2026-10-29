import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyTextMap,
  rememberTextSource,
  restoreTextSource,
  shouldAcceptTranslationResult,
  textsNeedingTranslation,
} from "@/lib/i18n/dom-cloud-translate";

function text(value: string) {
  return { nodeValue: value };
}

describe("dom cloud translate apply", () => {
  it("applies Hindi from English source", () => {
    const node = text("Choose a hosting plan");
    const result = applyTextMap([node], {
      "Choose a hosting plan": "एक होस्टिंग योजना चुनें",
    });
    assert.equal(result.applied, 1);
    assert.equal(node.nodeValue, "एक होस्टिंग योजना चुनें");
  });

  it("restores English then applies Japanese from the original, not from Hindi", () => {
    const node = text("Get started");
    applyTextMap([node], { "Get started": "शुरू करें" });
    assert.equal(node.nodeValue, "शुरू करें");
    restoreTextSource(node);
    assert.equal(node.nodeValue, "Get started");
    applyTextMap([node], { "Get started": "開始する" });
    assert.equal(node.nodeValue, "開始する");
  });

  it("handles ko and id map keys without treating them as English", () => {
    const node = text("Domains");
    applyTextMap([node], { Domains: "도메인" });
    assert.equal(node.nodeValue, "도메인");
    restoreTextSource(node);
    applyTextMap([node], { Domains: "Domain" });
    assert.equal(node.nodeValue, "Domain");
  });

  it("does not apply a stale result after a rapid language change", () => {
    assert.equal(
      shouldAcceptTranslationResult({
        runId: 1,
        currentRunId: 2,
        requestedLanguage: "hi",
        selectedLanguage: "ja",
      }),
      false,
    );
    assert.equal(
      shouldAcceptTranslationResult({
        runId: 2,
        currentRunId: 2,
        requestedLanguage: "ja",
        selectedLanguage: "ja",
      }),
      true,
    );
  });

  it("keeps original English when a later node already shows a translated value", () => {
    const map = { Hello: "नमस्ते" };
    const node = text("नमस्ते");
    assert.equal(rememberTextSource(node, map), "Hello");
  });

  it("does not re-request cached or skipped strings", () => {
    const missing = textsNeedingTranslation(
      ["Choose a plan", "$4.99/mo", "Choose a plan", "example.com"],
      { "Choose a plan": "एक योजना चुनें" },
    );
    assert.deepEqual(missing, []);
  });
});
