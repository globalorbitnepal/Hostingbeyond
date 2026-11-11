import { catalogForSlug } from "@/lib/hosting/international-launch-catalog";
import type { HostingCartQuote } from "@/lib/hosting/cart/types";
import type { HostingBillingCycle } from "@/lib/hosting/purchase-intent";

const STARTER_WEB_TAGLINE =
  "Perfect for personal websites, blogs, and small businesses.";

export function checkoutPlanTagline(
  productSlug: string,
  planKey: string,
  fallbackPlanName: string,
) {
  if (productSlug === "web-hosting" && planKey === "starter") {
    return STARTER_WEB_TAGLINE;
  }
  const plan = catalogForSlug(productSlug)?.plans.find(
    (entry) => entry.planKey === planKey,
  );
  if (plan?.tagline) return plan.tagline;
  return `${fallbackPlanName} hosting, ready to go live.`;
}

export function checkoutPlanIsPopular(productSlug: string, planKey: string) {
  const plan = catalogForSlug(productSlug)?.plans.find(
    (entry) => entry.planKey === planKey,
  );
  return Boolean(plan?.popular) || planKey === "business";
}

export function hostingPlanCatalogHref(productSlug: string) {
  return `/${productSlug}#plans`;
}

export function annualSavePercent(discount: number, billedAmount: number) {
  const base = billedAmount + discount;
  if (discount <= 0 || base <= 0) return 0;
  return Math.round((discount / base) * 100);
}

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

/** Instantly reprice a quote when Monthly/Annually is clicked (no round-trip). */
export function applyHostingBillingPeriod(
  quote: HostingCartQuote,
  billing: HostingBillingCycle,
): HostingCartQuote {
  const monthly = quote.catalogMonthly;
  const yearly = quote.catalogYearly;
  if (!(monthly > 0) || !(yearly > 0)) {
    return {
      ...quote,
      configuration: { ...quote.configuration, billingPeriod: billing },
    };
  }

  const isAnnual = billing === "annually";
  const hostingList = roundMoney(monthly * (isAnnual ? 12 : 1));
  const hostingCharge = roundMoney(isAnnual ? yearly : monthly);
  const discount = roundMoney(Math.max(0, hostingList - hostingCharge));
  const extras = quote.lines
    .filter((line) => line.kind !== "hosting" && line.kind !== "discount")
    .reduce((sum, line) => sum + line.amount, 0);
  const rest = quote.lines.filter(
    (line) => line.kind !== "hosting" && line.kind !== "discount",
  );
  const lines = [
    {
      id: "hosting",
      label: "Hosting",
      amount: hostingList,
      kind: "hosting" as const,
    },
    ...(isAnnual && discount > 0
      ? [
          {
            id: "annual-discount",
            label: "Annual discount",
            amount: -discount,
            kind: "discount" as const,
          },
        ]
      : []),
    ...rest,
  ];
  const total = roundMoney(hostingCharge + extras);

  return {
    ...quote,
    configuration: {
      ...quote.configuration,
      billingPeriod: billing,
      domainRegisterUsd: isAnnual
        ? null
        : quote.configuration.domainRegisterUsd,
    },
    lines,
    discount,
    subtotal: total,
    total,
    billedAmount: hostingCharge,
    monthlyEquivalent: isAnnual ? roundMoney(yearly / 12) : monthly,
    renewalPrice: isAnnual ? roundMoney(yearly) : roundMoney(monthly),
    freeDomainEligible: isAnnual && quote.freeDomainAnnualOffered,
  };
}
