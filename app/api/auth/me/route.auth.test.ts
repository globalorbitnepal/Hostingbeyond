import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET } from "@/app/api/auth/me/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

  it("returns 401 when not signed in", async () => {
    const res = await GET();
    assert.equal(res.status, 401);
    const body = (await res.json()) as { user: unknown };
    assert.equal(body.user, null);
  });

  it("returns user when session override is set", async () => {
    setCustomerSessionTestOverride(async () => ({
      id: "cust_test_1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const res = await GET();
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      user: { id: string; email: string };
    };
    assert.equal(body.user.id, "cust_test_1");
    assert.equal(body.user.email, "test@example.com");
  });
});
