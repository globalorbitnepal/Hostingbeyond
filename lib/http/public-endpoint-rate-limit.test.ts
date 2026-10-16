import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { rateLimitAuthEndpoint } from "@/lib/http/public-endpoint-rate-limit";

describe("public endpoint rate limits", () => {
  it("blocks auth endpoints after budget exceeded for same client key", () => {
    const ip = `rate-limit-auth-${Date.now()}`;
    const request = () =>
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "x-real-ip": ip },
      });

    let allowed = 0;
    for (let i = 0; i < 25; i++) {
      if (rateLimitAuthEndpoint(request())) allowed++;
    }
    assert.ok(allowed >= 20);
    assert.equal(rateLimitAuthEndpoint(request()), false);
  });
});
