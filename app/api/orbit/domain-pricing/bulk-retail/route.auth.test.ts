import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { POST } from "@/app/api/orbit/domain-pricing/bulk-retail/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

describe("POST /api/orbit/domain-pricing/bulk-retail", () => {
  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
  });

  it("returns 401 without Orbit admin session", async () => {
    const res = await POST(
      new Request(
        "http://localhost/api/orbit/domain-pricing/bulk-retail?action=preview",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            items: [{ tld: ".com", retailRegister: 9.99 }],
          }),
        },
      ),
    );
    assert.equal(res.status, 401);
  });
});
