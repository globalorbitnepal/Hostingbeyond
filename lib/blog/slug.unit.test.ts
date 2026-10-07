import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeBlogSlug, slugifyTitle } from "@/lib/blog/slug";

describe("blog slug", () => {
  it("slugifies titles", () => {
    assert.equal(
      slugifyTitle("How to Choose the Best Web Hosting for Your Business"),
      "how-to-choose-the-best-web-hosting-for-your-business",
    );
  });

  it("normalizes manual slugs", () => {
    assert.equal(normalizeBlogSlug("  WordPress Tips  "), "wordpress-tips");
  });
});
