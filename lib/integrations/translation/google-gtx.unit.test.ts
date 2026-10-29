import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { translateTextsWithGoogleGtx } from "@/lib/integrations/translation/google-gtx";

describe("google gtx fallback", () => {
  it("reads translated text from the gtx payload", async () => {
    const fetchFn = (async () =>
      new Response(JSON.stringify([[["Hallo", "Hello"]]]), {
        status: 200,
        headers: { "content-type": "application/json" },
      })) as typeof fetch;
    const result = await translateTextsWithGoogleGtx(["Hello"], "de", fetchFn);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.translations, ["Hallo"]);
  });
});
