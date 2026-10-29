import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { translateTextsWithMyMemory } from "@/lib/integrations/translation/google-mymemory";

describe("mymemory fallback", () => {
  it("reads translatedText from the JSON payload", async () => {
    const fetchFn = (async () =>
      new Response(
        JSON.stringify({
          responseStatus: 200,
          responseData: { translatedText: "Hallo" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      )) as typeof fetch;
    const result = await translateTextsWithMyMemory(["Hello"], "de", fetchFn);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.translations, ["Hallo"]);
  });
});
