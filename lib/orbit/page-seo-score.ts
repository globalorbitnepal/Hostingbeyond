import type { StoredPageSeo } from "@/lib/orbit/page-seo";

export type PageSeoCheck = {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  hint?: string;
};

export type PageSeoScoreResult = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  checks: PageSeoCheck[];
};

function grade(score: number): PageSeoScoreResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Lightweight SEO completeness score for marketing pages (0–100). */
export function scorePageSeo(
  seo: StoredPageSeo,
  path: string,
): PageSeoScoreResult {
  const title = seo.metaTitle?.trim() ?? "";
  const desc = seo.metaDescription?.trim() ?? "";
  const keywords = seo.keywords?.trim() ?? "";
  const ogTitle = seo.ogTitle?.trim() ?? "";
  const ogDesc = seo.ogDescription?.trim() ?? "";
  const ogImage = seo.ogImage?.trim() ?? "";

  const checks: PageSeoCheck[] = [
    {
      id: "meta-title",
      label: "Meta title",
      passed: title.length >= 20 && title.length <= 70,
      points:
        title.length >= 20 && title.length <= 70
          ? 18
          : title.length > 0
            ? 8
            : 0,
      maxPoints: 18,
      hint: "Aim for 20–70 characters with your primary keyword.",
    },
    {
      id: "meta-description",
      label: "Meta description",
      passed: desc.length >= 80 && desc.length <= 170,
      points:
        desc.length >= 80 && desc.length <= 170 ? 18 : desc.length > 0 ? 8 : 0,
      maxPoints: 18,
      hint: "Write 80–170 characters that match search intent.",
    },
    {
      id: "keywords",
      label: "Focus keywords",
      passed: keywords.length >= 12,
      points: keywords.length >= 12 ? 12 : keywords.length > 0 ? 5 : 0,
      maxPoints: 12,
    },
    {
      id: "og-title",
      label: "Open Graph title",
      passed: ogTitle.length >= 10,
      points: ogTitle.length >= 10 ? 12 : ogTitle.length > 0 ? 5 : 0,
      maxPoints: 12,
    },
    {
      id: "og-description",
      label: "Open Graph description",
      passed: ogDesc.length >= 40,
      points: ogDesc.length >= 40 ? 12 : ogDesc.length > 0 ? 5 : 0,
      maxPoints: 12,
    },
    {
      id: "og-image",
      label: "Social share image",
      passed: ogImage.startsWith("/"),
      points: ogImage.startsWith("/") ? 14 : 0,
      maxPoints: 14,
      hint: "Use a path like /images/… or /uploads/…",
    },
    {
      id: "canonical-path",
      label: "Public URL path",
      passed: path.startsWith("/"),
      points: path.startsWith("/") ? 8 : 0,
      maxPoints: 8,
    },
    {
      id: "twitter",
      label: "Twitter / X fields",
      passed: Boolean(
        seo.twitterTitle?.trim() || seo.twitterDescription?.trim(),
      ),
      points:
        seo.twitterTitle?.trim() || seo.twitterDescription?.trim() ? 6 : 0,
      maxPoints: 6,
    },
  ];

  const score = Math.min(
    100,
    checks.reduce((sum, check) => sum + check.points, 0),
  );

  return { score, grade: grade(score), checks };
}
