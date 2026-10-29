import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_PUBLIC_SITE_ORIGIN,
  configuredSiteOrigin,
  isLoopbackHost,
  normalizeEnvSiteOrigin,
  resolveRequestSiteOrigin,
} from "@/lib/customer/site-origin";

describe("site origin resolution", () => {
  it("detects loopback hosts", () => {
    assert.equal(isLoopbackHost("localhost:3030"), true);
    assert.equal(isLoopbackHost("127.0.0.1:3030"), true);
    assert.equal(isLoopbackHost("hosting.theglobalorbit.com"), false);
  });

  it("uses forwarded public host instead of loopback bind address", () => {
    const origin = resolveRequestSiteOrigin({
      forwardedHost: "hosting.theglobalorbit.com",
      host: "127.0.0.1:3030",
      forwardedProto: "https",
    });
    assert.equal(origin, "https://hosting.theglobalorbit.com");
  });

  it("falls back to NEXT_PUBLIC_SITE_URL when request host is loopback", () => {
    const prev = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://hosting.theglobalorbit.com";
    try {
      const origin = resolveRequestSiteOrigin({
        host: "127.0.0.1:3030",
        forwardedProto: "http",
      });
      assert.equal(origin, "https://hosting.theglobalorbit.com");
      assert.ok(!origin.includes("localhost"));
      assert.ok(!origin.includes("3030"));
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = prev;
    }
  });

  it("default public origin is not loopback", () => {
    assert.equal(
      DEFAULT_PUBLIC_SITE_ORIGIN,
      "https://hosting.theglobalorbit.com",
    );
    assert.ok(!DEFAULT_PUBLIC_SITE_ORIGIN.includes("localhost"));
  });

  it("configuredSiteOrigin prefers NEXT_PUBLIC_SITE_URL", () => {
    const prevSite = process.env.NEXT_PUBLIC_SITE_URL;
    const prevApp = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://hostingbeyond.com";
    delete process.env.NEXT_PUBLIC_APP_URL;
    try {
      assert.equal(configuredSiteOrigin(), "https://hostingbeyond.com");
    } finally {
      if (prevSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = prevSite;
      if (prevApp === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = prevApp;
    }
  });

  it("ignores loopback NEXT_PUBLIC_SITE_URL in production mode", () => {
    assert.equal(
      normalizeEnvSiteOrigin("http://localhost:3030", { production: true }),
      null,
    );
    assert.equal(
      normalizeEnvSiteOrigin("https://hosting.theglobalorbit.com", {
        production: true,
      }),
      "https://hosting.theglobalorbit.com",
    );
  });

  it("allows local dev when ORBIT_ORIGIN is loopback and no public site URL", () => {
    const prevSite = process.env.NEXT_PUBLIC_SITE_URL;
    const prevApp = process.env.NEXT_PUBLIC_APP_URL;
    const prevOrbit = process.env.ORBIT_ORIGIN;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.ORBIT_ORIGIN = "http://localhost:3000";
    try {
      const origin = resolveRequestSiteOrigin({
        host: "localhost:3000",
        forwardedProto: "http",
      });
      assert.equal(origin, "http://localhost:3000");
    } finally {
      if (prevSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = prevSite;
      if (prevApp === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = prevApp;
      if (prevOrbit === undefined) delete process.env.ORBIT_ORIGIN;
      else process.env.ORBIT_ORIGIN = prevOrbit;
    }
  });
});
