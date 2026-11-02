import type { CmsHostingPlansContent } from "@/lib/orbit/defaults";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";
import { getHomeSections } from "@/lib/orbit/content";

import { getHostingProductBySlug } from "./hosting-products";
import { dbPlansToCmsHostingPlans } from "./plans-to-cms";
import { normalizePlanFeatures } from "./plan-claims";
import { applyProductPlansTrustChips } from "./product-plans-trust-chips";

/**
 * Single source of truth for the public Web Hosting price cards.
 *
 * Prices and plan specs live in `HostingProductPlan` (Orbit → Hosting Plans).
 * The CMS `home` record still owns the surrounding marketing copy (eyebrow,
 * heading, guarantees, toggle labels), so both halves are merged here instead
 * of letting the home page show a stale duplicated price table.
 *
 * Order of resolution:
 * 1. DB catalog plans for `web-hosting` (authoritative price + specs).
 * 2. CMS home copy for headings, trust chips and guarantees.
 * 3. Static defaults when neither record exists yet.
 */
export async function getPublicWebHostingPlans(): Promise<CmsHostingPlansContent> {
  const [homeSections, product] = await Promise.all([
    getHomeSections().catch(() => null),
    getHostingProductBySlug("web-hosting").catch(() => null),
  ]);

  const cmsCopy = homeSections?.hostingPlans;
  const fallback = cmsCopy ?? defaultHostingPlansSection();

  if (!product || product.status !== "ACTIVE" || product.plans.length === 0) {
    return fallback;
  }

  const catalog = dbPlansToCmsHostingPlans(product.slug, product.plans);
  const merged: CmsHostingPlansContent = {
    ...fallback,
    ...catalog,
    // Marketing copy and layout toggles stay operator-controlled.
    visible: fallback.visible,
    eyebrow: fallback.eyebrow || catalog.eyebrow,
    title: fallback.title || catalog.title,
    titleAccent: fallback.titleAccent || catalog.titleAccent,
    description: fallback.description || catalog.description,
    saveBadge: fallback.saveBadge || catalog.saveBadge,
    annualToggleLabel: fallback.annualToggleLabel,
    monthlyToggleLabel: fallback.monthlyToggleLabel,
    defaultBilling: fallback.defaultBilling,
    guarantees: fallback.guarantees,
    plans: catalog.plans.map((plan) => ({
      ...plan,
      features: normalizePlanFeatures(plan.features ?? []),
    })),
  };

  return applyProductPlansTrustChips(
    product.slug,
    product.name,
    merged,
  ) as CmsHostingPlansContent;
}
