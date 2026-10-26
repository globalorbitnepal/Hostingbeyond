import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login validation", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );
    assert.equal(res.status, 400);
  });

  it("returns 400 for invalid email shape", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "not-an-email", password: "x" }),
      }),
    );
    assert.equal(res.status, 400);
  });
});
