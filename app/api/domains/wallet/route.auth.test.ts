import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET } from "@/app/api/domains/wallet/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("GET /api/domains/wallet", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

  it("returns 401 without customer session", async () => {
    const res = await GET();
    assert.equal(res.status, 401);
  });
});
