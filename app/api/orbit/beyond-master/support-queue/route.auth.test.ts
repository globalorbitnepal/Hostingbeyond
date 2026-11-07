import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { AdminUser } from "@prisma/client";

import { GET } from "@/app/api/orbit/beyond-master/support-queue/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

function admin(id: string): AdminUser {
  return {
    id,
    displayName: id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AdminUser;
}

describe("GET /api/orbit/beyond-master/support-queue authorization", () => {
  const prevSupport = process.env.ORBIT_SUPPORT_STAFF_IDS;
  const prevFull = process.env.ORBIT_FULL_ADMIN_IDS;
  const prevLegacy = process.env.ORBIT_LEGACY_OPEN_ORBIT;

  beforeEach(() => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_FULL_ADMIN_IDS = "full-1";
    process.env.ORBIT_SUPPORT_STAFF_IDS = "support-1";
    setOrbitAdminSessionTestOverride(async () => null);
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

  it("returns 401 without a session", async () => {
    const res = await GET(
      new Request("http://localhost/api/orbit/beyond-master/support-queue"),
    );
    assert.equal(res.status, 401);
  });

  it("returns 401 for an unknown admin id", async () => {
    setOrbitAdminSessionTestOverride(async () => admin("stranger"));
    const res = await GET(
      new Request("http://localhost/api/orbit/beyond-master/support-queue"),
    );
    assert.equal(res.status, 401);
  });
});
