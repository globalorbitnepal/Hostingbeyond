import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldSkipCloudTranslation } from "@/lib/integrations/translation/skip-policy";

describe("shouldSkipCloudTranslation", () => {
  it("skips prices, domains, ids, and currency amounts", () => {
    assert.equal(shouldSkipCloudTranslation("$4.99/mo"), true);
    assert.equal(shouldSkipCloudTranslation("12.99 USD"), true);
    assert.equal(shouldSkipCloudTranslation("example.com"), true);
    assert.equal(shouldSkipCloudTranslation(".com"), true);
    assert.equal(shouldSkipCloudTranslation("HB-PLAN-PRO"), true);
    assert.equal(shouldSkipCloudTranslation("https://hosting.example"), true);
  });

  it("allows ordinary marketing copy", () => {
    assert.equal(shouldSkipCloudTranslation("Choose a hosting plan"), false);
    assert.equal(shouldSkipCloudTranslation("Get started today"), false);
  });
});
