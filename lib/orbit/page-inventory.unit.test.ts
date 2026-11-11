import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getOrbitPageInventory } from "./page-inventory";

describe("getOrbitPageInventory", () => {
  const inventory = getOrbitPageInventory();

  it("never lists the same public path twice", () => {
    const seen = new Map<string, string>();
    for (const page of inventory) {
      const previous = seen.get(page.path);
      assert.equal(
        previous,
        undefined,
        `${page.path} appears twice (${previous} and ${page.slug})`,
      );
      seen.set(page.path, page.slug);
    }
  });

  it("never lists the same slug twice", () => {
    const slugs = inventory.map((page) => page.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("gives every page an Orbit editor path", () => {
    for (const page of inventory) {
      assert.match(
        page.editorHref,
        /^\/orbit(\/|$)/,
        `${page.slug} has a non-Orbit editor: ${page.editorHref}`,
      );
    }
  });

  it("points the retired SEO screen at the single Pages editor", () => {
    for (const page of inventory) {
      assert.notEqual(
        page.editorHref,
        "/orbit/seo",
        `${page.slug} still points at the removed duplicate SEO screen`,
      );
    }
  });

  it("files developer hosting pages under hosting, not Cloud & VPS", () => {
    const developerSlugs = [
      "nodejs-hosting",
      "laravel-hosting",
      "django-hosting",
      "nestjs-hosting",
      "python-hosting",
    ];
    for (const slug of developerSlugs) {
      const page = inventory.find((entry) => entry.slug === slug);
      assert.ok(page, `${slug} is missing from the page inventory`);
      assert.equal(
        page.category,
        "hosting",
        `${slug} is filed under ${page.category}`,
      );
    }
  });

  it("lists footer editorial pages with Orbit editors", () => {
    const slugs = [
      "careers",
      "affiliates",
      "partners",
      "infrastructure",
      "help",
      "status",
      "knowledge-base",
      "guides",
      "security",
      "wordpress-tutorials",
    ];
    for (const slug of slugs) {
      const page = inventory.find((entry) => entry.slug === slug);
      assert.ok(page, `${slug} is missing from the page inventory`);
      assert.equal(page.editorHref, `/orbit/editorial/${slug}`);
      assert.equal(page.seoMode, "content-editor");
    }
  });

  it("keeps every developer page in the sitemap inventory exactly once", () => {
    const developer = inventory.filter(
      (page) =>
        /-hosting$/.test(page.slug) &&
        ["nodejs", "laravel", "django", "nestjs", "python"].some((stack) =>
          page.slug.startsWith(stack),
        ),
    );
    assert.equal(developer.length, 5);
    assert.equal(new Set(developer.map((page) => page.path)).size, 5);
  });
});
