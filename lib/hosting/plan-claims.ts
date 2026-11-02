import type { CmsHostingPlan } from "@/lib/orbit/defaults";

/**
 * Fair-use wording for unlimited plans.
 *
 * The brief forbids claiming "unlimited resources" without a stated fair-use
 * policy, so any `Unlimited …` feature line is qualified once, here, instead of
 * being duplicated in every page editor. Keep the wording identical across
 * Web Hosting, WordPress, eCommerce, Cloud, Reseller and Agency.
 */
export const FAIR_USE_NOTE =
  "Fair use: unlimited within normal shared-hosting resource limits (CPU, RAM, inodes). Accounts that consistently exceed them are contacted before any action.";

const WEBSITE_FAIR_USE =
  "Unlimited websites (fair use — see resource limits below)";

/** Rewrites unsupported claims into defensible, accurate copy. */
export function normalizePlanFeatureLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return trimmed;

  // "Advanced Performance (5× Faster)" — no benchmark evidence exists.
  const performance = trimmed.replace(/\s*\(?\s*5\s*[×x]\s*faster\s*\)?/i, "");
  if (/^advanced performance$/i.test(performance.trim())) {
    return "Advanced performance tuning";
  }

  // "Unlimited Websites" → qualified fair-use wording.
  if (/^unlimited\s+(websites?|sites)$/i.test(trimmed)) {
    return WEBSITE_FAIR_USE;
  }

  // "Unmetered Bandwidth" is fine only with a fair-use qualifier.
  if (/^(unmetered|unlimited)\s+bandwidth$/i.test(trimmed)) {
    return "Unmetered bandwidth (fair use)";
  }

  return performance;
}

export function normalizePlanFeatures(features: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of features) {
    const line = normalizePlanFeatureLine(raw);
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/** True when the plan advertises unlimited sites, so the footnote must show. */
export function planNeedsFairUseNote(plan: Pick<CmsHostingPlan, "features">) {
  return (plan.features ?? []).some((line) => /unlimited/i.test(line));
}
