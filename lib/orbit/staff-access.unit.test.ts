import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  canOrbitBeyondMasterSupport,
  isOrbitFullAdmin,
  orbitAccessForAdmin,
  supportOnlyOrbitPathAllowed,
} from "@/lib/orbit/staff-access";

describe("orbit staff access", () => {
  const prevSupport = process.env.ORBIT_SUPPORT_STAFF_IDS;
  const prevFull = process.env.ORBIT_FULL_ADMIN_IDS;
  const prevLegacy = process.env.ORBIT_LEGACY_OPEN_ORBIT;

  afterEach(() => {
    process.env.ORBIT_SUPPORT_STAFF_IDS = prevSupport;
    process.env.ORBIT_FULL_ADMIN_IDS = prevFull;
    process.env.ORBIT_LEGACY_OPEN_ORBIT = prevLegacy;
  });

  it("fails closed for unknown id when lists are set and legacy off", () => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_SUPPORT_STAFF_IDS = "s1";
    process.env.ORBIT_FULL_ADMIN_IDS = "boss";
    assert.equal(orbitAccessForAdmin("unknown"), "none");
    assert.equal(canOrbitBeyondMasterSupport("unknown"), false);
  });

  it("legacy open orbit grants full when both lists empty", () => {
    process.env.ORBIT_LEGACY_OPEN_ORBIT = "true";
    delete process.env.ORBIT_SUPPORT_STAFF_IDS;
    delete process.env.ORBIT_FULL_ADMIN_IDS;
    assert.equal(orbitAccessForAdmin("any"), "full");
  });

  it("empty lists without legacy deny access", () => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    delete process.env.ORBIT_SUPPORT_STAFF_IDS;
    delete process.env.ORBIT_FULL_ADMIN_IDS;
    assert.equal(orbitAccessForAdmin("any"), "none");
    assert.equal(isOrbitFullAdmin("any"), false);
  });

  it("full list wins overlap with support list", () => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_SUPPORT_STAFF_IDS = "both";
    process.env.ORBIT_FULL_ADMIN_IDS = "both";
    assert.equal(orbitAccessForAdmin("both"), "full");
  });

  it("marks support-only ids when configured", () => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_SUPPORT_STAFF_IDS = "s1,s2";
    process.env.ORBIT_FULL_ADMIN_IDS = "boss";
    assert.equal(orbitAccessForAdmin("s1"), "support_only");
    assert.equal(orbitAccessForAdmin("boss"), "full");
    assert.equal(canOrbitBeyondMasterSupport("s1"), true);
    assert.equal(isOrbitFullAdmin("s1"), false);
  });

  it("ignores empty tokens and whitespace when parsing id lists", () => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    process.env.ORBIT_SUPPORT_STAFF_IDS = " s1 , , ";
    process.env.ORBIT_FULL_ADMIN_IDS = "  ";
    assert.equal(orbitAccessForAdmin("s1"), "support_only");
    assert.equal(orbitAccessForAdmin("s2"), "none");
  });

  it("fails closed for missing environment variables", () => {
    const env = {};
    assert.equal(orbitAccessForAdmin("boss", env), "none");
  });

  it("fails closed for malformed values (emails, wildcards, JSON, booleans)", () => {
    delete process.env.ORBIT_LEGACY_OPEN_ORBIT;
    const env = {
      ORBIT_FULL_ADMIN_IDS: 'admin@example.com,*,true,{"id":"boss"},all',
      ORBIT_SUPPORT_STAFF_IDS: "support@example.com; full ; *",
    };
    assert.equal(orbitAccessForAdmin("boss", env), "none");
    assert.equal(orbitAccessForAdmin("admin@example.com", env), "none");
    assert.equal(orbitAccessForAdmin("*", env), "none");
  });

  it("drops invalid duplicates and still matches a real id in the same list", () => {
    const env = {
      ORBIT_FULL_ADMIN_IDS: "boss,boss,admin@x.com,*",
      ORBIT_SUPPORT_STAFF_IDS: "",
    };
    assert.equal(orbitAccessForAdmin("boss", env), "full");
    assert.equal(orbitAccessForAdmin("admin@x.com", env), "none");
  });

  it("ignores client-supplied role overrides on the env object", () => {
    const env = {
      ORBIT_FULL_ADMIN_IDS: "boss",
      ORBIT_SUPPORT_STAFF_IDS: "s1",
      ORBIT_ROLE: "full",
      role: "full",
      ORBIT_LEGACY_OPEN_ORBIT: "false",
    };
    assert.equal(orbitAccessForAdmin("s1", env), "support_only");
    assert.equal(orbitAccessForAdmin("unknown", env), "none");
  });

  it("limits support-only navigation to the support queue and assigned conversations", () => {
    assert.equal(
      supportOnlyOrbitPathAllowed("/orbit/beyond-master/support-queue"),
      true,
    );
    assert.equal(
      supportOnlyOrbitPathAllowed("/orbit/beyond-master/conversations"),
      true,
    );
    assert.equal(supportOnlyOrbitPathAllowed("/api/orbit/me"), true);
    assert.equal(supportOnlyOrbitPathAllowed("/api/orbit/auth/logout"), true);
    assert.equal(supportOnlyOrbitPathAllowed("/orbit/wallets"), false);
    assert.equal(supportOnlyOrbitPathAllowed("/orbit/content"), false);
    assert.equal(supportOnlyOrbitPathAllowed("/orbit/settings"), false);
    assert.equal(supportOnlyOrbitPathAllowed("/orbit/invoices"), false);
    assert.equal(
      supportOnlyOrbitPathAllowed("/orbit/beyond-master/ai-budget"),
      false,
    );
    assert.equal(
      supportOnlyOrbitPathAllowed("/orbit/beyond-master/controls"),
      false,
    );
    assert.equal(
      supportOnlyOrbitPathAllowed("/api/orbit/beyond-master/features"),
      false,
    );
    assert.equal(
      supportOnlyOrbitPathAllowed("/api/orbit/beyond-master/gemini-usage"),
      false,
    );
    assert.equal(supportOnlyOrbitPathAllowed("/api/orbit/wallets"), false);
    assert.equal(
      supportOnlyOrbitPathAllowed("/orbit/beyond-master/support-queue-extra"),
      false,
    );
  });
});
