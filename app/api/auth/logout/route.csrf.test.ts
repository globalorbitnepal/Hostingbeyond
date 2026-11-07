import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout CSRF", () => {
  it("returns 403 for cross-origin browser POST", async () => {
    const res = await POST(
      new Request("https://hostingbeyond.test/api/auth/logout", {
        method: "POST",
        headers: { origin: "https://evil.example" },
      }),
    );
    assert.equal(res.status, 403);
  });

  it("returns 403 when strict and neither Origin nor Referer", async () => {
    const res = await POST(
      new Request("https://hostingbeyond.test/api/auth/logout", {
        method: "POST",
      }),
    );
    assert.equal(res.status, 403);
  });
});
