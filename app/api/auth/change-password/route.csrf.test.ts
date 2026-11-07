import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/auth/change-password/route";

describe("POST /api/auth/change-password CSRF", () => {
  it("returns 403 for cross-origin browser POST", async () => {
    const res = await POST(
      new Request("https://hostingbeyond.test/api/auth/change-password", {
        method: "POST",
        headers: {
          origin: "https://evil.example",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          newPassword: "newpassword1",
          confirmPassword: "newpassword1",
        }),
      }),
    );
    assert.equal(res.status, 403);
  });

  it("returns 403 when strict and neither Origin nor Referer present", async () => {
    const res = await POST(
      new Request("https://hostingbeyond.test/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          newPassword: "newpassword1",
          confirmPassword: "newpassword1",
        }),
      }),
    );
    assert.equal(res.status, 403);
  });
});
