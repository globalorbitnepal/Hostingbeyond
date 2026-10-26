import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { CustomerUser } from "@prisma/client";

import { POST } from "@/app/api/domains/checkout/register/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

const sessionUser: CustomerUser = {
  id: "route-auth-test-user",
  email: "route-auth@hostingbeyond.local",
  name: "Route Auth",
  passwordHash: null,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("POST /api/domains/checkout/register", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

  it("returns 401 without customer session", async () => {
    const res = await POST(
      new Request("http://localhost/api/domains/checkout/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: "example.com" }),
      }),
    );
    assert.equal(res.status, 401);
  });

  it("returns 400 for missing domain when session override would allow auth", async () => {
    setCustomerSessionTestOverride(async () => sessionUser);
    const res = await POST(
      new Request("http://localhost/api/domains/checkout/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    assert.equal(res.status, 400);
  });

  it("rejects client-supplied register price", async () => {
    setCustomerSessionTestOverride(async () => sessionUser);
    const res = await POST(
      new Request("http://localhost/api/domains/checkout/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: "example.com", register: 0.01 }),
      }),
    );
    assert.equal(res.status, 400);
    const json = (await res.json()) as { error?: string };
    assert.match(json.error ?? "", /server-side/i);
  });
});
