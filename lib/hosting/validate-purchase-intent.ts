import { getHostingProductBySlug } from "@/lib/hosting/hosting-products";
import { getRegistryEntryBySlug } from "@/lib/hosting/products-registry";

import type { HostingPurchaseIntent } from "./purchase-intent";
import { parseHostingBilling } from "./purchase-intent";

/** Registry + billing shape only (safe on client). */
export function validateHostingPurchaseIntentSync(
  intent: HostingPurchaseIntent,
): HostingPurchaseIntent | null {
  const registry = getRegistryEntryBySlug(intent.product);
  if (!registry) return null;
  const billing = parseHostingBilling(intent.billing);
  if (!billing) return null;
  const plan = intent.plan?.trim();
  if (!plan) return null;
  return { product: intent.product, plan, billing };
}

/** Authoritative validation against active HostingProductPlan rows. */
export async function validateHostingPurchaseIntent(
  intent: HostingPurchaseIntent,
): Promise<HostingPurchaseIntent | null> {
  const sync = validateHostingPurchaseIntentSync(intent);
  if (!sync) return null;

  const product = await getHostingProductBySlug(sync.product);
  if (!product || product.status !== "ACTIVE") return null;

  const plan = product.plans.find((p) => p.active && p.planKey === sync.plan);
  if (!plan) return null;

  if (sync.billing === "monthly" && !product.billingMonthlyEnabled) {
    return null;
  }
  if (sync.billing === "annually" && !product.billingYearlyEnabled) {
    return null;
  }

  return sync;
}
