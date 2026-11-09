import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  requestIp,
  resolveRequestCountry,
} from "@/lib/customer/request-country";

function headers(map: Record<string, string>) {
  return new Headers(map);
}

function cookies(map: Record<string, string>) {
  return {
    get(name: string) {
      const value = map[name];
      return value === undefined ? undefined : { value };
    },
  };
}

describe("resolveRequestCountry", () => {
  it("prefers CDN country headers", () => {
    assert.equal(
      resolveRequestCountry({
        headers: headers({ "cf-ipcountry": "np" }),
      }),
      "NP",
    );
  });

  it("falls back to the saved market cookie", () => {
    assert.equal(
      resolveRequestCountry({
        headers: headers({}),
        cookies: cookies({ hb_prefs: JSON.stringify({ country: "in" }) }),
      }),
      "IN",
    );
  });

  it("ignores placeholder and invalid codes", () => {
    assert.equal(
      resolveRequestCountry({
        headers: headers({ "cf-ipcountry": "XX", "x-country-code": "zzz" }),
        cookies: cookies({}),
      }),
      null,
    );
  });
});

describe("requestIp", () => {
  it("takes the first forwarded hop", () => {
    assert.equal(
      requestIp({
        headers: headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }),
      }),
      "203.0.113.9",
    );
  });

  it("returns null when no address is present", () => {
    assert.equal(requestIp({ headers: headers({}) }), null);
  });
});
