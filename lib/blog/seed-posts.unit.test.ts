import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { scoreBlogSeo } from "./seo-score";
import { STARTER_POSTS } from "./seed-posts";

/**
 * The starter library is what new visitors see before the team writes anything,
 * so every seeded article must already be strong on-page SEO.
 */
describe("starter blog posts", () => {
  it("ships several substantial articles", () => {
    assert.ok(STARTER_POSTS.length >= 4);
    for (const post of STARTER_POSTS) {
      assert.ok(post.contentHtml.length > 1500, `${post.slug} too short`);
      assert.ok(post.focusKeyword.length > 0);
      assert.ok(post.seoTitle.length <= 65, `${post.slug} seo title long`);
      assert.ok(
        post.seoDescription.length >= 120 && post.seoDescription.length <= 165,
        `${post.slug} meta description outside 120-165`,
      );
      assert.ok(
        post.excerpt.length >= 100 && post.excerpt.length <= 180,
        `${post.slug} excerpt outside 100-180`,
      );
    }
  });

  it("scores 85 or higher on the editor SEO checks", () => {
    for (const post of STARTER_POSTS) {
      const result = scoreBlogSeo({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        contentHtml: post.contentHtml,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        focusKeyword: post.focusKeyword,
        ogTitle: post.seoTitle,
        ogDescription: post.seoDescription,
        coverImageUrl: "/images/blog/cover.jpg",
        coverImageAlt: post.title,
      });
      const failed = result.checks
        .filter((c) => c.status !== "good")
        .map((c) => `${c.id} (${c.earned}/${c.max})`)
        .join(", ");
      assert.ok(
        result.score >= 85,
        `${post.slug} scored ${result.score}; failing: ${failed}`,
      );
    }
  });
});
