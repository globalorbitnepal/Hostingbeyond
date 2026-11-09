import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  planSiteLimit,
  readHostingSites,
  validateSiteDomain,
  validateSiteName,
} from "@/lib/hosting/customer-hosting-sites";

describe("readHostingSites", () => {
  it("returns nothing for a missing or malformed configuration", () => {
    assert.deepEqual(readHostingSites(null), []);
    assert.deepEqual(readHostingSites({}), []);
    assert.deepEqual(readHostingSites({ sites: "nope" }), []);
  });

  it("keeps valid site rows and drops unknown types", () => {
    const sites = readHostingSites({
      sites: [
        {
          id: "site_1",
          type: "wordpress",
          name: "Shop",
          domain: "shop.example.com",
          status: "awaiting_setup",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        { id: "site_2", type: "not-a-type", name: "Bad" },
      ],
    });
    assert.equal(sites.length, 1);
    assert.equal(sites[0]?.type, "wordpress");
    assert.equal(sites[0]?.domain, "shop.example.com");
  });

  it("normalises an unknown status to awaiting_setup", () => {
    const [site] = readHostingSites({
      sites: [{ id: "a", type: "php-html", name: "Static", status: "???" }],
    });
    assert.equal(site?.status, "awaiting_setup");
  });
});

describe("validateSiteName", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(validateSiteName("  My   Shop "), "My Shop");
  });

  it("rejects empty and overlong names", () => {
    assert.equal(validateSiteName(" "), null);
    assert.equal(validateSiteName("x"), null);
    assert.equal(validateSiteName("x".repeat(61)), null);
  });
});

describe("validateSiteDomain", () => {
  it("accepts a normal domain and lowercases it", () => {
    assert.equal(validateSiteDomain("Shop.Example.com"), "shop.example.com");
  });

  it("rejects spaces and bare labels", () => {
    assert.equal(validateSiteDomain("not a domain"), null);
    assert.equal(validateSiteDomain("localhost"), null);
  });
});

describe("planSiteLimit", () => {
  it("reads a numeric allowance", () => {
    assert.equal(planSiteLimit("3 websites"), 3);
    assert.equal(planSiteLimit("1 website"), 1);
  });

  it("returns null for unlimited or unknown specs", () => {
    assert.equal(planSiteLimit("Unlimited websites"), null);
    assert.equal(planSiteLimit(null), null);
    assert.equal(planSiteLimit("No limit"), null);
  });
});
