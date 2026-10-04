import { getHostingProductBySlug } from "./hosting-products";
import type { HostingPurchaseIntent } from "./purchase-intent";
import { validateHostingPurchaseIntent } from "./validate-purchase-intent";

export type ResolvedHostingPurchaseContext = {
  intent: HostingPurchaseIntent;
  productName: string;
  planName: string;
  billingLabel: string;
  priceLabel: string;
  billedLabel: string;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export async function resolveHostingPurchaseContext(
  raw: HostingPurchaseIntent,
): Promise<ResolvedHostingPurchaseContext | null> {
  const intent = await validateHostingPurchaseIntent(raw);
  if (!intent) return null;

  const product = await getHostingProductBySlug(intent.product);
  if (!product || product.status !== "ACTIVE") return null;

  const plan = product.plans.find((p) => p.active && p.planKey === intent.plan);
  if (!plan) return null;

  const monthly = Number(plan.monthlyPrice);
  const yearly = Number(plan.yearlyPrice);
  const isAnnual = intent.billing === "annually";
  const priceLabel = isAnnual
    ? `${money(yearly / 12, plan.currency)}/mo`
    : `${money(monthly, plan.currency)}/mo`;
  const billedLabel = isAnnual
    ? `Billed ${money(yearly, plan.currency)}/yr`
    : `Billed ${money(monthly, plan.currency)}/mo`;

  return {
    intent,
    productName: product.name,
    planName: plan.planName,
    billingLabel: isAnnual ? "Annual billing" : "Monthly billing",
    priceLabel,
    billedLabel,
  };
}
