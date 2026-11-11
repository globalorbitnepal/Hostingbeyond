import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultFooterSection, retargetFooterHref } from "./defaults";

describe("footer href retarget", () => {
  it("sends migration support to the live migration product", () => {
    assert.equal(
      retargetFooterHref("migrate", "/resources/migrate"),
      "/website-migration",
    );
  });

  it("sends SEO tips to the existing tips hub", () => {
    assert.equal(
      retargetFooterHref("seo", "/resources/seo"),
      "/resources/tips",
    );
  });

  it("uses live paths in the default footer", () => {
    const footer = defaultFooterSection();
    const links = footer.columns.flatMap((column) => column.links);
    assert.equal(
      links.find((link) => link.id === "migrate")?.href,
      "/website-migration",
    );
    assert.equal(
      links.find((link) => link.id === "seo")?.href,
      "/resources/tips",
    );
    assert.equal(
      links.find((link) => link.id === "careers")?.href,
      "/about/careers",
    );
    assert.equal(
      links.find((link) => link.id === "help")?.href,
      "/resources/help",
    );
  });
});
