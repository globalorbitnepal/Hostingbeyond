/**
 * Editorial SEO scoring for blog posts.
 *
 * Pure functions only so the score can be rendered in the Orbit editor (client)
 * and in the Orbit SEO dashboard (server) with identical results.
 */

export type SeoCheckStatus = "good" | "warn" | "bad";

export type SeoCheck = {
  id: string;
  label: string;
  status: SeoCheckStatus;
  earned: number;
  max: number;
  hint: string;
};

export type BlogSeoInput = {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  keywords?: string[] | null;
};

export type BlogSeoGrade = "Excellent" | "Good" | "Needs work" | "Poor";

export type BlogSeoScore = {
  score: number;
  grade: BlogSeoGrade;
  passed: number;
  total: number;
  checks: SeoCheck[];
};

export function stripBlogHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&rsquo;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function countBlogWords(html: string): number {
  const text = stripBlogHtml(html);
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}

function occurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function check(
  id: string,
  label: string,
  max: number,
  ratio: number,
  hint: string,
): SeoCheck {
  const clamped = Math.max(0, Math.min(1, ratio));
  const earned = Math.round(clamped * max);
  const status: SeoCheckStatus =
    clamped >= 0.999 ? "good" : clamped > 0 ? "warn" : "bad";
  return { id, label, status, earned, max, hint };
}

function lengthScore(value: string, min: number, max: number): number {
  const len = value.trim().length;
  if (len === 0) return 0;
  if (len < min) return 0.5;
  if (len > max) return 0.6;
  return 1;
}

export function scoreBlogSeo(input: BlogSeoInput): BlogSeoScore {
  const title = input.title?.trim() ?? "";
  const slug = input.slug?.trim() ?? "";
  const excerpt = input.excerpt?.trim() ?? "";
  const seoTitle = (input.seoTitle ?? "").trim();
  const seoDescription = (input.seoDescription ?? "").trim();
  const focusKeyword = (input.focusKeyword ?? "").trim().toLowerCase();
  const ogTitle = (input.ogTitle ?? "").trim();
  const ogDescription = (input.ogDescription ?? "").trim();
  const coverImageUrl = (input.coverImageUrl ?? "").trim();
  const coverImageAlt = (input.coverImageAlt ?? "").trim();
  const keywordPlural = focusKeyword.replace(/-/g, " ");

  const plain = stripBlogHtml(input.contentHtml ?? "").toLowerCase();
  const words = countBlogWords(input.contentHtml ?? "");
  const h2Count = (input.contentHtml.match(/<h2[\s>]/gi) ?? []).length;
  const h3Count = (input.contentHtml.match(/<h3[\s>]/gi) ?? []).length;
  const internalLinks = (input.contentHtml.match(/href="(\/[^"]*)"/gi) ?? [])
    .length;
  const externalLinks = (
    input.contentHtml.match(/href="https?:\/\/[^"]+"/gi) ?? []
  ).length;
  const keywordHits = focusKeyword
    ? occurrences(plain, keywordPlural) + occurrences(plain, focusKeyword)
    : 0;
  const keywordDensity = words > 0 ? (keywordHits / words) * 100 : 0;

  const checks: SeoCheck[] = [
    check(
      "seo-title",
      "SEO title is 30–60 characters",
      14,
      lengthScore(seoTitle, 30, 65),
      seoTitle
        ? `${seoTitle.length} characters — aim for 30–60.`
        : "Add a custom SEO title (30–60 characters).",
    ),
    check(
      "meta-description",
      "Meta description is 120–160 characters",
      14,
      lengthScore(seoDescription, 120, 165),
      seoDescription
        ? `${seoDescription.length} characters — aim for 120–160.`
        : "Add a meta description (120–160 characters).",
    ),
    check(
      "focus-keyword",
      "Focus keyword is set",
      8,
      focusKeyword ? 1 : 0,
      focusKeyword
        ? `Focus keyword: “${focusKeyword}”.`
        : "Pick one focus keyword for this article.",
    ),
    check(
      "keyword-in-title",
      "Focus keyword appears in the title",
      8,
      focusKeyword && title.toLowerCase().includes(keywordPlural) ? 1 : 0,
      focusKeyword
        ? "Use the focus keyword in the article title."
        : "Set a focus keyword first.",
    ),
    check(
      "keyword-in-slug",
      "Focus keyword appears in the slug",
      7,
      focusKeyword &&
        slug.toLowerCase().includes(focusKeyword.replace(/\s+/g, "-"))
        ? 1
        : 0,
      "Keep the slug short and include the focus keyword.",
    ),
    check(
      "keyword-in-meta",
      "Focus keyword appears in the meta description",
      6,
      focusKeyword && seoDescription.toLowerCase().includes(keywordPlural)
        ? 1
        : 0,
      "Mention the focus keyword in the meta description.",
    ),
    check(
      "excerpt",
      "Excerpt is 100–180 characters",
      6,
      excerpt ? (excerpt.length >= 100 && excerpt.length <= 180 ? 1 : 0.5) : 0,
      excerpt
        ? `${excerpt.length} characters — aim for 100–180.`
        : "Write a short excerpt for cards and social previews.",
    ),
    check(
      "slug-format",
      "Slug is clean and readable",
      7,
      slug
        ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 75
          ? 1
          : 0.4
        : 0,
      slug
        ? "Lowercase words separated by single hyphens, ideally under 60 characters."
        : "Add a slug (permanent link).",
    ),
    check(
      "content-length",
      "Article is at least 300 words",
      10,
      words === 0
        ? 0
        : words >= 900
          ? 1
          : words >= 600
            ? 0.85
            : words >= 300
              ? 0.7
              : 0.35,
      `${words} words — 900+ words ranks best for competitive topics.`,
    ),
    check(
      "headings",
      "Content uses H2 / H3 subheadings",
      8,
      h2Count >= 3 ? 1 : h2Count >= 1 ? 0.6 : 0,
      h2Count
        ? `${h2Count} H2 and ${h3Count} H3 headings.`
        : "Break the article into H2 sections for readability.",
    ),
    check(
      "internal-links",
      "Content links to other HostingBeyond pages",
      7,
      internalLinks >= 2 ? 1 : internalLinks === 1 ? 0.6 : 0,
      internalLinks
        ? `${internalLinks} internal link(s) found.`
        : "Add at least one link to a HostingBeyond page.",
    ),
    check(
      "external-links",
      "Content cites an external source",
      4,
      externalLinks >= 1 ? 1 : 0,
      externalLinks
        ? `${externalLinks} external link(s) found.`
        : "Cite one authoritative outside source.",
    ),
    check(
      "cover-image",
      "Cover image is set",
      6,
      coverImageUrl ? 1 : 0,
      coverImageUrl
        ? "Cover image set."
        : "Add a cover image for the article hero and cards.",
    ),
    check(
      "image-alt",
      "Cover image has descriptive alt text",
      4,
      coverImageAlt ? 1 : 0,
      "Alt text helps accessibility and image SEO.",
    ),
    check(
      "social-preview",
      "Open Graph title and description are set",
      5,
      ogTitle && ogDescription ? 1 : ogTitle || ogDescription ? 0.5 : 0,
      "Customise the social share title and description.",
    ),
    check(
      "keyword-density",
      "Focus keyword density is 0.4%–2.5%",
      6,
      focusKeyword
        ? keywordDensity >= 0.4 && keywordDensity <= 2.5
          ? 1
          : keywordDensity > 0
            ? 0.5
            : 0
        : 0,
      focusKeyword
        ? `${keywordDensity.toFixed(2)}% — avoid keyword stuffing.`
        : "Set a focus keyword to measure density.",
    ),
  ];

  const total = checks.reduce((sum, item) => sum + item.max, 0);
  const earned = checks.reduce((sum, item) => sum + item.earned, 0);
  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  const passed = checks.filter((item) => item.status === "good").length;

  return {
    score,
    grade:
      score >= 85
        ? "Excellent"
        : score >= 70
          ? "Good"
          : score >= 45
            ? "Needs work"
            : "Poor",
    passed,
    total: checks.length,
    checks,
  };
}

export function seoScoreTone(score: number): "green" | "amber" | "red" {
  if (score >= 85) return "green";
  if (score >= 60) return "amber";
  return "red";
}
