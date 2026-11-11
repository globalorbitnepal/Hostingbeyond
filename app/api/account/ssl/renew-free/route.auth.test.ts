import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { POST } from "@/app/api/account/ssl/renew-free/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("POST /api/account/ssl/renew-free", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });
  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });
  it("returns 401 without customer session", async () => {
    const res = await POST(
      new Request("http://localhost/api/account/ssl/renew-free", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: "example.com" }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
