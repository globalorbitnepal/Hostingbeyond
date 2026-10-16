import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/auth/forgot-password/route";

describe("POST /api/auth/forgot-password", () => {
  it("returns 501 when password reset is not configured", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "user@example.com" }),
      }),
    );
    assert.equal(res.status, 501);
    const body = (await res.json()) as { code?: string };
    assert.equal(body.code, "password_reset_not_configured");
  });
});
