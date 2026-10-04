import {
  hostingCheckoutPath,
  type HostingBillingCycle,
  type HostingPurchaseIntent,
} from "@/lib/hosting/purchase-intent";

/** Shared Buy now → cart URL for every hosting product. */
export function hostingCheckoutHref(
  productSlug: string,
  planKey: string,
  billing: HostingBillingCycle = "annually",
): string {
  return hostingCheckoutPath({
    product: productSlug,
    plan: planKey,
    billing,
  });
}

export function hostingCheckoutHrefFromIntent(intent: HostingPurchaseIntent) {
  return hostingCheckoutPath(intent);
}
