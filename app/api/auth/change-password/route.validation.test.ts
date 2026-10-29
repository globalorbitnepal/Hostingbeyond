import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { POST } from "@/app/api/auth/change-password/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("POST /api/auth/change-password validation", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

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

  it("rejects short passwords before auth", async () => {
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
    assert.equal(res.status, 400);
  });
});
