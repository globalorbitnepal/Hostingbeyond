import type { CmsHostingPlan } from "@/lib/orbit/defaults";
import type { CatalogPlan } from "@/config/pricing-plans";

export function catalogPlanToCms(plan: CatalogPlan, order = 0): CmsHostingPlan {
  return {
    id: plan.id,
    visible: true,
    order,
    name: plan.name,
    tagline: plan.tagline,
    discountBadge: plan.discountBadge ?? "",
    popular: plan.popular ?? false,
    popularLabel: plan.popularLabel ?? "",
    accent: plan.popular ? "gradient" : "blue",
    priceAnnually: plan.priceAnnually,
    originalAnnually: plan.originalAnnually ?? "",
    billedAnnually: plan.billedAnnually,
    saveAnnually: plan.saveAnnually ?? "",
    priceMonthly: plan.priceMonthly,
    originalMonthly: plan.originalMonthly ?? "",
    billedMonthly: plan.billedMonthly,
    saveMonthly: plan.saveMonthly ?? "",
    domainPerk: plan.domainPerk ?? "",
    annualCredit: plan.annualCredit ?? "",
    features: plan.features,
    ctaLabel: plan.ctaLabel,
    ctaHref: plan.ctaHref,
  };
}
