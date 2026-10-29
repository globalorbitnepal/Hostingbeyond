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

/** Parse operator-edited CMS price strings into ledger USD (supports "$4.99" and "19.99$"). */
export function catalogUsdFromCmsPriceCopy(
  stored: Partial<CmsHostingPlan>,
): Partial<CmsHostingCatalogUsd> {
  const monthlyUsd = parseUsdPrice(stored.priceMonthly ?? "");
  const yearlyFromBilled = parseUsdPrice(stored.billedAnnually ?? "");
  const annualPerMonth = parseUsdPrice(stored.priceAnnually ?? "");
  let yearlyUsd = yearlyFromBilled;
  if (!(yearlyUsd > 0) && annualPerMonth > 0) {
    yearlyUsd = Math.round(annualPerMonth * 12 * 100) / 100;
  }
  if (monthlyUsd > 0 && yearlyUsd > 0) {
    return { monthlyUsd, yearlyUsd };
  }
  if (monthlyUsd > 0) {
    return { monthlyUsd, yearlyUsd: monthlyUsd * 12 };
  }
  if (yearlyUsd > 0) {
    return { monthlyUsd: yearlyUsd / 12, yearlyUsd };
  }
  return {};
}

function cmsPublicPriceCopyMatches(
  stored: Partial<CmsHostingPlan> | undefined,
  fallback: CmsHostingPlan,
): boolean {
  const priceAnnually = stored?.priceAnnually ?? fallback.priceAnnually;
  const priceMonthly = stored?.priceMonthly ?? fallback.priceMonthly;
  const billedAnnually = stored?.billedAnnually ?? fallback.billedAnnually;
  return (
    priceAnnually === fallback.priceAnnually &&
    priceMonthly === fallback.priceMonthly &&
    billedAnnually === fallback.billedAnnually
  );
}

/** Keep DB/CMS numeric amounts, or derive USD from edited Orbit price copy. */
export function catalogUsdAfterCmsMerge(
  stored: Partial<CmsHostingPlan> | undefined,
  fallback: CmsHostingPlan,
): Partial<CmsHostingCatalogUsd> {
  const explicit = resolveCmsHostingCatalogUsd({
    monthlyUsd: stored?.monthlyUsd,
    yearlyUsd: stored?.yearlyUsd,
  });
  if (explicit) return explicit;

  if (cmsPublicPriceCopyMatches(stored, fallback)) {
    return resolveCmsHostingCatalogUsd(fallback) ?? {};
  }
  return catalogUsdFromCmsPriceCopy(stored ?? {});
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
