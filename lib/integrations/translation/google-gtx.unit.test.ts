import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { translateTextsWithGoogleGtx } from "@/lib/integrations/translation/google-gtx";

describe("google gtx fallback", () => {
  it("reads a batched array payload for several strings", async () => {
    const calls: string[] = [];
    const fetchFn = (async (input: RequestInfo | URL) => {
      calls.push(String(input));
      return new Response(JSON.stringify(["Hallo", "Welt"]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
    const result = await translateTextsWithGoogleGtx(
      ["Hello", "World"],
      "de",
      fetchFn,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.translations, ["Hallo", "Welt"]);
    assert.equal(calls.length, 1, "one request per batch, not per string");
  });

  it("falls back to the single endpoint when the batch shape is unexpected", async () => {
    let call = 0;
    const fetchFn = (async () => {
      call += 1;
      if (call === 1) {
        return new Response(JSON.stringify({ unexpected: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify([[["Hallo", "Hello"]]]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;
    const result = await translateTextsWithGoogleGtx(["Hello"], "de", fetchFn);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.translations, ["Hallo"]);
  });
});
