import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { GET } from "@/app/api/orbit/domain-orders/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("GET /api/orbit/domain-orders", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("returns 401 without Orbit admin session", async () => {
    const res = await GET(
      new Request("http://localhost/api/orbit/domain-orders"),
    );
    assert.equal(res.status, 401);
  });
});
