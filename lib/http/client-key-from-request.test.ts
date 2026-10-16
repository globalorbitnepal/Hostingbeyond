import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { clientKeyFromRequest } from "@/lib/http/fixed-window-rate-limit";

describe("clientKeyFromRequest", () => {
  it("prefers X-Real-IP over X-Forwarded-For", () => {
    const req = new Request("http://localhost/", {
      headers: {
        "x-real-ip": "203.0.113.10",
        "x-forwarded-for": "198.51.100.1, 203.0.113.10",
      },
    });
    assert.equal(clientKeyFromRequest(req), "203.0.113.10");
  });

  it("uses last X-Forwarded-For hop when X-Real-IP is absent", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "spoofed, 203.0.113.55" },
    });
    assert.equal(clientKeyFromRequest(req), "203.0.113.55");
  });
});
