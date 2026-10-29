import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isGoogleCloudTranslateEnabled } from "@/lib/integrations/translation/config";
import {
  classifyTranslateError,
  translateTextsWithGoogleCloud,
} from "@/lib/integrations/translation/google-cloud";

describe("google-cloud-translate adapter", () => {
  it("stays disabled without GOOGLE_TRANSLATE_ENABLED=true", () => {
    assert.equal(
      isGoogleCloudTranslateEnabled({
        GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
        GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
      }),
      false,
    );
  });

  it("fails closed when enabled without a credentials path", async () => {
    const result = await translateTextsWithGoogleCloud(["Hello"], "hi", {
      GOOGLE_TRANSLATE_ENABLED: "true",
      GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
    });
    assert.deepEqual(result, {
      ok: false,
      code: "translation_not_configured",
    });
  });

  it("does not call a vendor when unconfigured", async () => {
    let called = 0;
    const result = await translateTextsWithGoogleCloud(
      ["Hello"],
      "hi",
      {},
      async () => {
        called += 1;
        return ["नमस्ते"];
      },
    );
    assert.equal(called, 0);
    assert.deepEqual(result, {
      ok: false,
      code: "translation_not_configured",
    });
  });

  it("uses the injected translator when enabled (no live vendor call)", async () => {
    const result = await translateTextsWithGoogleCloud(
      ["Hello"],
      "hi",
      {
        GOOGLE_TRANSLATE_ENABLED: "true",
        GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
        GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
      },
      async (input) => input.texts.map((text) => `${text}:hi`),
    );
    assert.deepEqual(result, { ok: true, translations: ["Hello:hi"] });
  });

  it("classifies auth, permission, and quota failures without exposing details", async () => {
    assert.equal(
      classifyTranslateError({ code: 16, message: "UNAUTHENTICATED" }),
      "translation_auth_failed",
    );
    assert.equal(
      classifyTranslateError({ code: 7, message: "PERMISSION_DENIED" }),
      "translation_permission_denied",
    );
    assert.equal(
      classifyTranslateError({ code: 8, message: "RESOURCE_EXHAUSTED" }),
      "translation_quota",
    );
    const result = await translateTextsWithGoogleCloud(
      ["Hello"],
      "ko",
      {
        GOOGLE_TRANSLATE_ENABLED: "true",
        GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
        GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
      },
      async () => {
        throw new Error("PERMISSION_DENIED");
      },
    );
    assert.deepEqual(result, {
      ok: false,
      code: "translation_permission_denied",
    });
  });
});
