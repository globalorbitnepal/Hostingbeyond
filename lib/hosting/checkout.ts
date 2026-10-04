import { routes } from "@/config/routes";

/** Unified hosting checkout entry — signup flow reads product + plan. */
export function hostingCheckoutHref(productSlug: string, planKey: string) {
  const params = new URLSearchParams({
    product: productSlug,
    plan: planKey,
  });
  return `${routes.getStarted}?${params.toString()}`;
}
