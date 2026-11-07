import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { AdminUser } from "@prisma/client";

import {
  requireOrbitAdmin,
  requireOrbitBeyondMasterSupport,
  requireOrbitFullAdmin,
} from "@/lib/orbit/api";
import { setOrbitAdminSessionTestOverride } from "@/lib/test/orbit-admin-session-test-control";

function admin(id: string): AdminUser {
  return {
    id,
    displayName: id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AdminUser;
}

describe("orbit API authorization helpers", () => {
  const prevSupport = process.env.ORBIT_SUPPORT_STAFF_IDS;
  const prevFull = process.env.ORBIT_FULL_ADMIN_IDS;
  const prevLegacy = process.env.ORBIT_LEGACY_OPEN_ORBIT;

  beforeEach(() => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_FULL_ADMIN_IDS = "full-1";
    process.env.ORBIT_SUPPORT_STAFF_IDS = "support-1";
    setOrbitAdminSessionTestOverride(null);
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

  it("lets an approved full admin through full-admin and support helpers", async () => {
    setOrbitAdminSessionTestOverride(async () => admin("full-1"));
    assert.equal((await requireOrbitFullAdmin())?.id, "full-1");
    assert.equal((await requireOrbitBeyondMasterSupport())?.id, "full-1");
    assert.equal((await requireOrbitAdmin())?.id, "full-1");
  });

  it("lets support-only staff into the support helper but not full admin", async () => {
    setOrbitAdminSessionTestOverride(async () => admin("support-1"));
    assert.equal((await requireOrbitBeyondMasterSupport())?.id, "support-1");
    assert.equal(await requireOrbitFullAdmin(), null);
    assert.equal((await requireOrbitAdmin())?.id, "support-1");
  });

  it("denies unknown authenticated admins", async () => {
    setOrbitAdminSessionTestOverride(async () => admin("stranger"));
    assert.equal(await requireOrbitAdmin(), null);
    assert.equal(await requireOrbitFullAdmin(), null);
    assert.equal(await requireOrbitBeyondMasterSupport(), null);
  });

  it("fails closed when role lists are missing", async () => {
    delete process.env.ORBIT_FULL_ADMIN_IDS;
    delete process.env.ORBIT_SUPPORT_STAFF_IDS;
    setOrbitAdminSessionTestOverride(async () => admin("full-1"));
    assert.equal(await requireOrbitAdmin(), null);
  });

  it("fails closed when role lists are invalid", async () => {
    process.env.ORBIT_FULL_ADMIN_IDS = "true,*,admin@x.com";
    process.env.ORBIT_SUPPORT_STAFF_IDS = "all";
    setOrbitAdminSessionTestOverride(async () => admin("full-1"));
    assert.equal(await requireOrbitFullAdmin(), null);
  });

  it("ignores a client-supplied role field on the admin record", async () => {
    setOrbitAdminSessionTestOverride(
      async () =>
        ({
          ...admin("support-1"),
          role: "full",
        }) as AdminUser,
    );
    assert.equal(await requireOrbitFullAdmin(), null);
    assert.equal((await requireOrbitBeyondMasterSupport())?.id, "support-1");
  });

  it("returns null with no session", async () => {
    setOrbitAdminSessionTestOverride(async () => null);
    assert.equal(await requireOrbitAdmin(), null);
  });
});
