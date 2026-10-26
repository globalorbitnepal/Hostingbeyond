import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET, POST } from "@/app/api/domains/cart/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("Domain cart API auth", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });
  it("GET returns 401 without customer session", async () => {
    const res = await GET();
    assert.equal(res.status, 401);
  });

  it("POST without session is rejected for tampered price payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/domains/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: "x.com", register: 1 }),
      }),
    );
    assert.equal(res.status, 401);
  });

  it("POST returns 401 for bulk add without session", async () => {
    const res = await POST(
      new Request("http://localhost/api/domains/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domains: ["a.com"] }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
