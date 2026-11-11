import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EDITORIAL_PAGES,
  defaultEditorialPageContent,
  isEditorialSlug,
  mergeEditorialPageContent,
} from "./editorial-page-content";

describe("editorial footer pages", () => {
  it("ships a default long page for every editorial slug", () => {
    for (const page of EDITORIAL_PAGES) {
      assert.equal(isEditorialSlug(page.slug), true);
      const content = defaultEditorialPageContent(page.slug);
      assert.ok(content.seoTitle.length > 20, page.slug);
      assert.ok(content.seoDescription.length > 40, page.slug);
      assert.ok(content.sections.length >= 2, page.slug);
      assert.ok(content.faqs.length >= 1, page.slug);
    }
  });

  it("keeps stored Orbit copy on merge", () => {
    const merged = mergeEditorialPageContent("careers", {
      heroTitle: "Custom careers hero",
      sections: [
        { id: "who", title: "Edited", body: "New body", bullets: ["A"] },
      ],
    });
    assert.equal(merged.heroTitle, "Custom careers hero");
    assert.equal(merged.sections[0]?.title, "Edited");
    assert.ok(merged.seoTitle.includes("Careers"));
  });
});
