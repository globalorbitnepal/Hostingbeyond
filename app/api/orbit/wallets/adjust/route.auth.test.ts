import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { AdminUser } from "@prisma/client";

import { POST } from "@/app/api/orbit/wallets/adjust/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

function supportOnlyAdmin(): AdminUser {
  return {
    id: "orbit_wallet_support_test",
    displayName: "Support",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("POST /api/orbit/wallets/adjust authorization", () => {
  let prevSupport: string | undefined;
  let prevFull: string | undefined;
  let prevLegacy: string | undefined;

  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
    prevSupport = process.env.ORBIT_SUPPORT_STAFF_IDS;
    prevFull = process.env.ORBIT_FULL_ADMIN_IDS;
    prevLegacy = process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_SUPPORT_STAFF_IDS = "orbit_wallet_support_test";
    process.env.ORBIT_FULL_ADMIN_IDS = "";
    process.env.ORBIT_LEGACY_OPEN_ORBIT = "0";
  });

  afterEach(() => {
    setOrbitAdminSessionTestOverride(null);
    if (prevSupport === undefined) delete process.env.ORBIT_SUPPORT_STAFF_IDS;
    else process.env.ORBIT_SUPPORT_STAFF_IDS = prevSupport;
    if (prevFull === undefined) delete process.env.ORBIT_FULL_ADMIN_IDS;
    else process.env.ORBIT_FULL_ADMIN_IDS = prevFull;
    if (prevLegacy === undefined) delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    else process.env.ORBIT_LEGACY_OPEN_ORBIT = prevLegacy;
  });

  it("returns 401 without Orbit session", async () => {
    const res = await POST(
      new Request("http://localhost/api/orbit/wallets/adjust", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
    );
    assert.equal(res.status, 401);
  });

  it("returns 401 for support-only staff (full admin required)", async () => {
    setOrbitAdminSessionTestOverride(async () => supportOnlyAdmin());
    const res = await POST(
      new Request("http://localhost/api/orbit/wallets/adjust", {
        method: "POST",
        headers: {
          origin: "http://localhost",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId: "x",
          direction: "credit",
          amount: 10,
          reason: "test",
        }),
      }),
    );
    assert.equal(res.status, 401);
  });
});
