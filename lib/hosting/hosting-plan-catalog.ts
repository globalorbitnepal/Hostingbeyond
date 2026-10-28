import { parseUsdPrice } from "@/lib/hosting/parse-price";
import type { CmsHostingPlan } from "@/lib/orbit/defaults";

function finiteUsd(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

export type CmsHostingCatalogUsd = {
  monthlyUsd: number;
  yearlyUsd: number;
};

/** Prefer explicit numeric catalog amounts. Never parse operator CMS copy. */
export function resolveCmsHostingCatalogUsd(
  plan: Pick<CmsHostingPlan, "monthlyUsd" | "yearlyUsd">,
): CmsHostingCatalogUsd | null {
  const monthlyUsd = finiteUsd(plan.monthlyUsd);
  const yearlyUsd = finiteUsd(plan.yearlyUsd);
  if (monthlyUsd == null || yearlyUsd == null) return null;
  return { monthlyUsd, yearlyUsd };
}

/**
 * Attach USD catalog amounts from *controlled* default strings only.
 * Do not use this on Orbit-edited CMS rows.
 */
export function attachControlledCatalogUsd(
  plan: CmsHostingPlan,
): CmsHostingPlan {
  const monthlyUsd = parseUsdPrice(plan.priceMonthly);
  const yearlyFromBilled = parseUsdPrice(plan.billedAnnually);
  const yearlyUsd = yearlyFromBilled > 0 ? yearlyFromBilled : monthlyUsd * 12;
  if (!(monthlyUsd > 0) || !(yearlyUsd > 0)) return plan;
  return { ...plan, monthlyUsd, yearlyUsd };
}

/** Keep DB/CMS numeric amounts, or reuse fallback numbers when price copy is unchanged. */
export function catalogUsdAfterCmsMerge(
  stored: Partial<CmsHostingPlan> | undefined,
  fallback: CmsHostingPlan,
): Partial<CmsHostingCatalogUsd> {
  const explicit = resolveCmsHostingCatalogUsd({
    monthlyUsd: stored?.monthlyUsd,
    yearlyUsd: stored?.yearlyUsd,
  });
  if (explicit) return explicit;

  const priceMonthly = stored?.priceMonthly ?? fallback.priceMonthly;
  const billedAnnually = stored?.billedAnnually ?? fallback.billedAnnually;
  if (
    priceMonthly === fallback.priceMonthly &&
    billedAnnually === fallback.billedAnnually
  ) {
    return resolveCmsHostingCatalogUsd(fallback) ?? {};
  }
  return {};
}

export function catalogUsdFromExplicit(
  stored: Partial<CmsHostingPlan> | undefined,
): Partial<CmsHostingCatalogUsd> {
  return (
    resolveCmsHostingCatalogUsd({
      monthlyUsd: stored?.monthlyUsd,
      yearlyUsd: stored?.yearlyUsd,
    }) ?? {}
  );
}

export function schemaOrgOfferPriceUsd(
  plan: CmsHostingPlan,
  billing: "annually" | "monthly" = "annually",
): string | undefined {
  const catalog = resolveCmsHostingCatalogUsd(plan);
  if (!catalog) return undefined;
  const amount =
    billing === "monthly" ? catalog.monthlyUsd : catalog.yearlyUsd / 12;
  return amount.toFixed(2);
}
