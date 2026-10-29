import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { rateLimitCloudTranslate } from "@/lib/http/public-endpoint-rate-limit";

describe("rateLimitCloudTranslate", () => {
  it("allows a burst then rejects extra posts from the same client", () => {
    const req = new Request("http://localhost/api/i18n/translate", {
      headers: { "x-real-ip": "203.0.113.88" },
    });
    let allowed = 0;
    let blocked = 0;
    for (let i = 0; i < 62; i += 1) {
      if (rateLimitCloudTranslate(req)) allowed += 1;
      else blocked += 1;
    }
    assert.equal(allowed, 60);
    assert.equal(blocked, 2);
  });
});
