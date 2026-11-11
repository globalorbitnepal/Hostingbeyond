import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET, POST } from "@/app/api/account/billing/cards/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("/api/account/billing/cards", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });
  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });
  it("returns 401 without customer session", async () => {
    const getRes = await GET();
    assert.equal(getRes.status, 401);
    const postRes = await POST();
    assert.equal(postRes.status, 401);
  });
});
