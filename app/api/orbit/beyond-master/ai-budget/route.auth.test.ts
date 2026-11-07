/**
 * Orbit AI budget metrics / recovery — session + role regression.
 *
 * Cross-origin blocking is asserted in `lib/http/same-origin-mutation.unit.test.ts`
 * with `ignoreTestBypass: true`. A prior route-level cross-origin test was not kept
 * because `crossOriginBrowserMutationBlocked` is a no-op when `NODE_ENV=test` on routes.
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { AdminUser } from "@prisma/client";

import { GET, POST } from "@/app/api/orbit/beyond-master/ai-budget/route";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

function supportOnlyAdmin(): AdminUser {
  return {
    id: "orbit_support_only_test",
    email: "support@test.local",
    name: "Support",
    passwordHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("/api/orbit/beyond-master/ai-budget auth", () => {
  let prevSupport: string | undefined;
  let prevFull: string | undefined;
  let prevLegacy: string | undefined;

  beforeEach(() => {
    setOrbitAdminSessionTestOverride(async () => null);
    prevSupport = process.env.ORBIT_SUPPORT_STAFF_IDS;
    prevFull = process.env.ORBIT_FULL_ADMIN_IDS;
    prevLegacy = process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_SUPPORT_STAFF_IDS = "orbit_support_only_test";
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

  it("returns 401 without Orbit session on GET", async () => {
    const res = await GET();
    assert.equal(res.status, 401);
  });

  it("returns 401 without Orbit session on POST", async () => {
    const res = await POST(
      new Request("http://localhost/api/orbit/beyond-master/ai-budget", {
        method: "POST",
      }),
    );
    assert.equal(res.status, 401);
  });

  it("returns 401 for support-only staff on POST (full admin required)", async () => {
    setOrbitAdminSessionTestOverride(async () => supportOnlyAdmin());
    const res = await POST(
      new Request("http://localhost/api/orbit/beyond-master/ai-budget", {
        method: "POST",
      }),
    );
    assert.equal(res.status, 401);
  });
});
