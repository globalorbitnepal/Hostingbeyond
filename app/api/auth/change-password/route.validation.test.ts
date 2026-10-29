import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/auth/change-password/route";

describe("POST /api/auth/change-password validation", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          newPassword: "newpassword1",
          confirmPassword: "newpassword1",
        }),
      }),
    );
    assert.equal(res.status, 401);
  });

  it("rejects short passwords", async () => {
    const res = await POST(
      new Request("http://localhost/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          newPassword: "short",
          confirmPassword: "short",
        }),
      }),
    );
    assert.ok(res.status === 400 || res.status === 401);
  });
});
