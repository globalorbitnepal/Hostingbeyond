import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/auth/register/route";

describe("POST /api/auth/register validation", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );
    assert.equal(res.status, 400);
  });

  it("returns 400 for short password", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "new-user@example.com",
          password: "short",
        }),
      }),
    );
    assert.equal(res.status, 400);
  });
});
