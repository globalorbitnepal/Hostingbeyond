import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cloudTranslateRequestSchema,
  totalTranslateChars,
  TRANSLATE_MAX_CHARS_TOTAL,
} from "@/lib/integrations/translation/request";

describe("cloudTranslateRequestSchema", () => {
  it("accepts required Cloud Translation targets including ko, id, and zh-CN", () => {
    for (const targetLanguage of ["hi", "ko", "id", "zh-CN"] as const) {
      const parsed = cloudTranslateRequestSchema.safeParse({
        targetLanguage,
        texts: ["Choose a hosting plan"],
      });
      assert.equal(parsed.success, true, targetLanguage);
    }
  });

  it("rejects English and unknown targets", () => {
    assert.equal(
      cloudTranslateRequestSchema.safeParse({
        targetLanguage: "en",
        texts: ["Hello"],
      }).success,
      false,
    );
    assert.equal(
      cloudTranslateRequestSchema.safeParse({
        targetLanguage: "xx",
        texts: ["Hello"],
      }).success,
      false,
    );
  });

  it("rejects oversized batches", () => {
    const tooMany = cloudTranslateRequestSchema.safeParse({
      targetLanguage: "es",
      texts: Array.from({ length: 41 }, () => "Hello"),
    });
    assert.equal(tooMany.success, false);
    assert.ok(
      totalTranslateChars(["a".repeat(3000), "b".repeat(3001)]) >
        TRANSLATE_MAX_CHARS_TOTAL,
    );
  });
});
