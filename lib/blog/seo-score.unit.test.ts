import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countBlogWords, scoreBlogSeo, stripBlogHtml } from "./seo-score";

const richArticle = `
  <p>Choosing web hosting for a small business is mostly about matching resources to real traffic.</p>
  <h2>Understand your traffic</h2>
  <p>Start with realistic visitor numbers and page views per month before comparing plans.</p>
  <h2>Check server speed</h2>
  <p>LiteSpeed and NVMe storage keep time to first byte low for WordPress sites.</p>
  <h2>Plan for growth</h2>
  <p>Pick a host that lets you upgrade without migrating again.</p>
  ${"<p>Web hosting for small business should include staging, backups and daily malware scanning so your team can ship changes safely.</p>".repeat(14)}
  <p>Compare plans on our <a href="/web-hosting">web hosting page</a> and read the <a href="/resources/tips">hosting guides</a>, plus the <a href="https://web.dev/vitals/">Core Web Vitals</a> documentation.</p>
`;

describe("blog SEO score", () => {
  it("strips HTML and counts words", () => {
    assert.equal(
      stripBlogHtml("<p>Hello <strong>world</strong></p>"),
      "Hello world",
    );
    assert.equal(countBlogWords("<h2>One</h2><p>two three</p>"), 3);
    assert.equal(countBlogWords(""), 0);
  });

  it("scores an empty post low", () => {
    const score = scoreBlogSeo({
      title: "",
      slug: "",
      excerpt: "",
      contentHtml: "",
    });
    assert.ok(score.score < 20, `expected low score, got ${score.score}`);
    assert.equal(score.grade, "Poor");
    assert.ok(score.checks.every((c) => c.status !== "good"));
  });

  it("rewards a well optimised article", () => {
    const score = scoreBlogSeo({
      title: "Web Hosting for Small Business: A Practical Guide",
      slug: "web-hosting-for-small-business",
      excerpt:
        "A practical guide to picking web hosting for small business — speed, support, security, backups and pricing compared in plain language for growing teams.",
      contentHtml: richArticle,
      seoTitle: "Web Hosting for Small Business: 2026 Buyer Guide",
      seoDescription:
        "Compare web hosting for small business on speed, security, backups and support. A practical 2026 checklist for choosing the right plan without overpaying.",
      focusKeyword: "web hosting for small business",
      ogTitle: "Web Hosting for Small Business",
      ogDescription: "How to choose a hosting plan that fits real traffic.",
      coverImageUrl: "/images/blog/cover.jpg",
      coverImageAlt: "Dashboard showing hosting uptime",
    });
    assert.ok(
      score.score >= 85,
      `expected excellent score, got ${score.score}`,
    );
    assert.equal(score.grade, "Excellent");
  });

  it("caps checks so total score stays within 0-100", () => {
    const score = scoreBlogSeo({
      title: "x",
      slug: "x",
      excerpt: "x",
      contentHtml: "<p>x</p>",
      seoTitle: "x".repeat(500),
      seoDescription: "y".repeat(500),
      focusKeyword: "x",
    });
    assert.ok(score.score >= 0 && score.score <= 100);
    for (const item of score.checks) {
      assert.ok(item.earned <= item.max, `${item.id} exceeded max`);
    }
  });
});
