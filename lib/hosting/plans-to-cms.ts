import type { HostingProductPlan } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

import { hostingCheckoutHref } from "@/lib/hosting/checkout";
import type {
  CmsHostingPlan,
  CmsHostingPlansContent,
} from "@/lib/orbit/defaults";
import { defaultHostingPlansSection } from "@/lib/orbit/defaults";

function money(value: Decimal | number, currency = "USD") {
  const n = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function accentForIndex(index: number): CmsHostingPlan["accent"] {
  if (index === 1) return "purple";
  if (index === 2) return "gradient";
  return "blue";
}

export function dbPlansToCmsHostingPlans(
  productSlug: string,
  plans: HostingProductPlan[],
): CmsHostingPlansContent {
  const shell = defaultHostingPlansSection();
  const active = plans
    .filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const cmsPlans: CmsHostingPlan[] = active.map((plan, index) => {
    const monthly = Number(plan.monthlyPrice);
    const yearly = Number(plan.yearlyPrice);
    const features = Array.isArray(plan.features)
      ? (plan.features as string[])
      : [];
    const featureLines = features.length
      ? features
      : [
          plan.storage ? `${plan.storage} storage` : "",
          plan.bandwidth ? `${plan.bandwidth} bandwidth` : "",
          plan.websites ? `${plan.websites} websites` : "",
          plan.ssl ? plan.ssl : "Free SSL",
        ].filter(Boolean);

    const annualMonthlyEquiv = yearly / 12;
    const discountPct =
      monthly > 0 ? Math.round((1 - annualMonthlyEquiv / monthly) * 100) : 0;
    const annualSavingsUsd = monthly * 12 - yearly;

    return {
      id: plan.planKey,
      visible: true,
      order: plan.sortOrder,
      name: plan.planName,
      tagline: plan.tagline ?? "",
      discountBadge: discountPct >= 1 ? `${discountPct}% OFF` : "",
      popular: plan.popular,
      popularLabel: plan.popular ? "Most popular" : "",
      accent: accentForIndex(index),
      priceMonthly: money(monthly, plan.currency),
      originalMonthly: "",
      billedMonthly: `Billed ${money(monthly, plan.currency)}/mo`,
      saveMonthly: "",
      priceAnnually: money(annualMonthlyEquiv, plan.currency),
      originalAnnually: money(monthly, plan.currency),
      billedAnnually: `Billed ${money(yearly, plan.currency)}/yr`,
      saveAnnually:
        annualSavingsUsd > 0
          ? `Save ${money(annualSavingsUsd, plan.currency)}`
          : discountPct > 0
            ? `Save ${discountPct}%`
            : "",
      domainPerk: "",
      annualCredit: "",
      features: featureLines,
      ctaLabel: "Buy now",
      ctaHref: hostingCheckoutHref(productSlug, plan.planKey),
    };
  });

  return {
    ...shell,
    plans: cmsPlans,
  };
}

export function startingPriceLabel(plans: HostingProductPlan[]): string {
  const active = plans.filter((p) => p.active);
  if (!active.length) return "—";
  const min = active.reduce((acc, p) => {
    const m = Number(p.monthlyPrice);
    return m < acc ? m : acc;
  }, Number(active[0].monthlyPrice));
  return `${money(min)}/mo`;
}
