import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  rateLimitAuthEndpoint,
  rateLimitMigrationRequest,
} from "@/lib/http/public-endpoint-rate-limit";

describe("public endpoint rate limits", () => {
  it("limits migration requests per IP", () => {
    const ip = `rate-limit-migration-${Date.now()}`;
    const request = () =>
      new Request("http://localhost/api/migration/request", {
        headers: { "x-forwarded-for": ip },
      });
    let allowed = 0;
    for (let i = 0; i < 8; i++) {
      if (rateLimitMigrationRequest(request())) allowed++;
    }
    assert.ok(allowed <= 6);
  });
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
