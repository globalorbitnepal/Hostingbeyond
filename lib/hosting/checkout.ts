import { routes } from "@/config/routes";

/** Unified hosting checkout entry — signup flow reads product + plan. */
export function hostingCheckoutHref(
  productSlug: string,
  planKey: string,
  billing?: "monthly" | "annually",
) {
  const params = new URLSearchParams({
    product: productSlug,
    plan: planKey,
  });
  if (billing) params.set("billing", billing);
  return `${routes.getStarted}?${params.toString()}`;
}
