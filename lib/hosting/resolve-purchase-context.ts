import { getHostingProductBySlug } from "./hosting-products";
import { hostingPurchaseDisplay } from "./purchase-display";
import type { HostingPurchaseIntent } from "./purchase-intent";
import { validateHostingPurchaseIntent } from "./validate-purchase-intent";

export type ResolvedHostingPurchaseContext = {
  intent: HostingPurchaseIntent;
  productName: string;
  planName: string;
  billingLabel: string;
  priceLabel: string;
  billedLabel: string;
  /** Ledger amounts. Use CatalogPrice only when isUsdLedger is true. */
  displayAmount: number;
  billedAmount: number;
  billedPeriod: "month" | "year";
  isUsdLedger: boolean;
};

export async function resolveHostingPurchaseContext(
  raw: HostingPurchaseIntent,
): Promise<ResolvedHostingPurchaseContext | null> {
  const intent = await validateHostingPurchaseIntent(raw);
  if (!intent) return null;

  const product = await getHostingProductBySlug(intent.product);
  if (!product || product.status !== "ACTIVE") return null;

  const plan = product.plans.find((p) => p.active && p.planKey === intent.plan);
  if (!plan) return null;

  const display = hostingPurchaseDisplay({
    monthlyPrice: Number(plan.monthlyPrice),
    yearlyPrice: Number(plan.yearlyPrice),
    billing: intent.billing,
    currency: plan.currency,
  });
  const isAnnual = intent.billing === "annually";

  return {
    intent,
    productName: product.name,
    planName: plan.planName,
    billingLabel: isAnnual ? "Annual billing" : "Monthly billing",
    priceLabel: display.priceLabel,
    billedLabel: display.billedLabel,
    displayAmount: display.displayAmount,
    billedAmount: display.billedAmount,
    billedPeriod: display.billedPeriod,
    isUsdLedger: display.isUsdLedger,
  };
}
