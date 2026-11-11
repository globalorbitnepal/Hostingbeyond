import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildMetadata } from "./metadata";

describe("buildMetadata", () => {
  it("does not double-brand a title that already ends with the brand", () => {
    const meta = buildMetadata({
      title: "Web Hosting with NVMe SSD & Free SSL | HostingBeyond",
      path: "/web-hosting",
    });
    assert.equal(
      meta.title,
      "Web Hosting with NVMe SSD & Free SSL | HostingBeyond",
    );
  });

  it("keeps a brand-first tab title without appending the brand again", () => {
    const meta = buildMetadata({
      title: "HostingBeyond – Web Hosting, Domains, Email & More",
      path: "/",
    });
    assert.equal(
      meta.title,
      "HostingBeyond – Web Hosting, Domains, Email & More",
    );
  });

  it("uses the brand-first tab title when no page title is passed", () => {
    const meta = buildMetadata({ path: "/" });
    assert.equal(
      meta.title,
      "HostingBeyond – Web Hosting, Domains, Email & More",
    );
  });

  it("appends the brand once when missing", () => {
    const meta = buildMetadata({
      title: "Domain Name Search",
      path: "/domain-name-search",
    });
    assert.equal(meta.title, "Domain Name Search | HostingBeyond");
  });

  it("accepts an en-dash brand suffix without duplicating it", () => {
    const meta = buildMetadata({
      title: "About HostingBeyond — Global Web Hosting",
      path: "/about",
    });
    assert.equal(
      meta.title,
      "About HostingBeyond — Global Web Hosting | HostingBeyond",
    );
  });

  it("keeps canonical URLs absolute", () => {
    const meta = buildMetadata({ title: "Pricing", path: "/pricing" });
    assert.equal(
      meta.alternates?.canonical,
      "https://hosting.theglobalorbit.com/pricing",
    );
  });

  it("honours noindex", () => {
    const meta = buildMetadata({
      title: "Login",
      path: "/login",
      noIndex: true,
    });
    assert.deepEqual(meta.robots, { index: false, follow: false });
  });
});
