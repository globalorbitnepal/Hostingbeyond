import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { POST } from "@/app/api/hosting/orders/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("POST /api/hosting/orders", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

  it("returns 401 without customer session", async () => {
    const res = await POST(
      new Request("http://localhost/api/hosting/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productSlug: "x", planKey: "y" }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
