import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GET, POST } from "@/app/api/i18n/translate/route";

describe("/api/i18n/translate", () => {
  it("reports disabled without claiming a live vendor session", async () => {
    const previous = process.env.GOOGLE_TRANSLATE_ENABLED;
    delete process.env.GOOGLE_TRANSLATE_ENABLED;
    try {
      const res = await GET();
      const body = (await res.json()) as {
        configured: boolean;
        note: string;
        liveTranslationVerified?: boolean;
      };
      assert.equal(res.status, 200);
      assert.equal(body.configured, false);
      assert.equal(body.liveTranslationVerified, false);
      assert.match(body.note, /not configured/i);
    } finally {
      if (previous === undefined) delete process.env.GOOGLE_TRANSLATE_ENABLED;
      else process.env.GOOGLE_TRANSLATE_ENABLED = previous;
    }
  });

  it("fails closed on POST when translation is not enabled", async () => {
    const previous = process.env.GOOGLE_TRANSLATE_ENABLED;
    delete process.env.GOOGLE_TRANSLATE_ENABLED;
    try {
      const res = await POST(
        new Request("http://localhost/api/i18n/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ targetLanguage: "hi", texts: ["Hello"] }),
        }),
      );
      assert.equal(res.status, 503);
      const body = (await res.json()) as { error: string };
      assert.equal(body.error, "translation_not_configured");
    } finally {
      if (previous === undefined) delete process.env.GOOGLE_TRANSLATE_ENABLED;
      else process.env.GOOGLE_TRANSLATE_ENABLED = previous;
    }
  });
});
