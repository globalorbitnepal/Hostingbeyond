import { catalogForSlug } from "@/lib/hosting/international-launch-catalog";

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
