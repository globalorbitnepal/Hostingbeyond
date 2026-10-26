import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET } from "@/app/api/domains/[registrationId]/route";
import { setCustomerSessionTestOverride } from "@/lib/test/customer-session-test-control";

describe("GET /api/domains/[registrationId]", () => {
  beforeEach(() => {
    setCustomerSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setCustomerSessionTestOverride(null);
  });

  it("returns 401 without customer session", async () => {
    const res = await GET(new Request("http://localhost/api/domains/r1"), {
      params: Promise.resolve({ registrationId: "r1" }),
    });
    assert.equal(res.status, 401);
  });
});
