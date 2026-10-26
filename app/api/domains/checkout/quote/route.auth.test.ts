import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { POST } from "@/app/api/domains/checkout/quote/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("POST /api/domains/checkout/quote auth", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

  it("returns 401 without customer session", async () => {
    const res = await POST(
      new Request("http://localhost/api/domains/checkout/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ services: [] }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
