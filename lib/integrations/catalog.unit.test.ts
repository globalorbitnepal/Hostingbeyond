import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INTEGRATION_CATALOG,
  allCatalogEnvKeys,
} from "@/lib/integrations/catalog";

describe("INTEGRATION_CATALOG", () => {
  it("keeps unique ids and isolates Google OAuth from Translate", () => {
    const ids = INTEGRATION_CATALOG.map((slot) => slot.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.includes("google-oauth"));
    assert.ok(ids.includes("google-website-translate"));
    assert.ok(ids.includes("google-cloud-translate"));
    assert.ok(ids.includes("namesilo-search"));
    assert.ok(ids.includes("namesilo-lifecycle"));
    assert.ok(ids.includes("domain-name-api"));
  });

  it("uses the Facebook and Orbit env names the app actually reads", () => {
    const keys = allCatalogEnvKeys();
    assert.ok(keys.includes("FACEBOOK_APP_ID"));
    assert.ok(keys.includes("FACEBOOK_APP_SECRET"));
    assert.ok(keys.includes("ORBIT_SESSION_SECRET"));
    assert.equal(keys.includes("FACEBOOK_CLIENT_ID"), false);
    assert.equal(keys.includes("SESSION_SECRET"), false);
    assert.equal(keys.includes("ORBIT_ACCESS_KEY"), false);
  });

  it("never stores secret values on the catalog objects", () => {
    const serialized = JSON.stringify(
      INTEGRATION_CATALOG.map((slot) => ({
        id: slot.id,
        envKeys: slot.envKeys,
        vendor: slot.vendor,
      })),
    );
    assert.equal(serialized.includes("sk_"), false);
    assert.equal(serialized.includes("postgresql://"), false);
  });
});
