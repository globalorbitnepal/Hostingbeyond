import type { CmsHostingPlan } from "@/lib/orbit/defaults";

import { hostingCheckoutHref } from "./checkout";
import type { InternationalLaunchPlan } from "./international-launch-catalog";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function internationalLaunchPlanToCms(
  plan: InternationalLaunchPlan,
  productSlug: string,
  order: number,
  options?: { ctaLabel?: string; domainPerk?: string },
): CmsHostingPlan {
  const monthly = plan.monthlyPrice;
  const yearly = plan.yearlyPrice;
  const annualMonthly = yearly / 12;
  const discountPct =
    monthly > 0 ? Math.round((1 - annualMonthly / monthly) * 100) : 0;
  const annualSavings = Math.round((monthly * 12 - yearly) * 100) / 100;
  const accent: CmsHostingPlan["accent"] = plan.popular
    ? "gradient"
    : order === 2
      ? "purple"
      : "blue";

  return {
    id: plan.planKey,
    visible: true,
    order,
    name: plan.planName,
    tagline: plan.tagline,
    discountBadge: discountPct >= 1 ? `${discountPct}% OFF` : "",
    popular: Boolean(plan.popular),
    popularLabel: plan.popular ? "Most Popular" : "",
    accent,
    priceAnnually: money(annualMonthly),
    originalAnnually: money(monthly),
    billedAnnually: `Billed ${money(yearly)} annually`,
    saveAnnually: annualSavings > 0 ? `Save ${money(annualSavings)}` : "",
    priceMonthly: money(monthly),
    originalMonthly: "",
    billedMonthly: "Billed monthly",
    saveMonthly: "",
    domainPerk:
      options?.domainPerk ??
      (productSlug === "web-hosting" ? "Domain — free for 1 year" : ""),
    annualCredit: "",
    features: plan.features,
    ctaLabel: options?.ctaLabel ?? "Get Started",
    ctaHref: hostingCheckoutHref(productSlug, plan.planKey, "annually"),
  };
}
