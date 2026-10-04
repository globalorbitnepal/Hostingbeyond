import { routes } from "@/config/routes";

import { getRegistryEntryBySlug } from "./products-registry";

export const WEB_HOSTING_PLAN_KEYS = [
  "essential",
  "plus",
  "pro",
  "ultimate",
] as const;

export type WebHostingPlanKey = (typeof WEB_HOSTING_PLAN_KEYS)[number];
export type HostingBillingCycle = "monthly" | "annually";

export type HostingPurchaseIntent = {
  product: string;
  plan: string;
  billing: HostingBillingCycle;
};

const BILLING_VALUES = new Set<HostingBillingCycle>(["monthly", "annually"]);

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function isWebHostingPlanKey(plan: string): plan is WebHostingPlanKey {
  return (WEB_HOSTING_PLAN_KEYS as readonly string[]).includes(plan);
}

export function parseHostingBilling(
  raw: string | null | undefined,
): HostingBillingCycle | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase();
  if (normalized === "annual" || normalized === "yearly") return "annually";
  if (BILLING_VALUES.has(normalized as HostingBillingCycle)) {
    return normalized as HostingBillingCycle;
  }
  return null;
}

export function parseHostingPurchaseIntent(
  params: URLSearchParams,
): HostingPurchaseIntent | null {
  const product = params.get("product")?.trim();
  const plan = params.get("plan")?.trim();
  const billing = parseHostingBilling(params.get("billing"));
  if (!product || !plan || !billing) return null;
  return validateHostingPurchaseIntent({ product, plan, billing });
}

export function parseHostingPurchaseIntentFromRecord(
  record: Record<string, string | string[] | undefined>,
): HostingPurchaseIntent | null {
  const params = new URLSearchParams();
  const product = firstParam(record.product);
  const plan = firstParam(record.plan);
  const billing = firstParam(record.billing);
  if (product) params.set("product", product);
  if (plan) params.set("plan", plan);
  if (billing) params.set("billing", billing);
  return parseHostingPurchaseIntent(params);
}

/** Returns null when product/plan/billing combination is not allowed. */
export function validateHostingPurchaseIntent(
  intent: HostingPurchaseIntent,
): HostingPurchaseIntent | null {
  const registry = getRegistryEntryBySlug(intent.product);
  if (!registry) return null;

  if (intent.product === "web-hosting" && !isWebHostingPlanKey(intent.plan)) {
    return null;
  }

  if (!BILLING_VALUES.has(intent.billing)) return null;

  return intent;
}

export function serializeHostingPurchaseIntent(
  intent: HostingPurchaseIntent,
): string {
  const params = new URLSearchParams({
    product: intent.product,
    plan: intent.plan,
    billing: intent.billing,
  });
  return params.toString();
}

export function hostingCheckoutPath(intent: HostingPurchaseIntent): string {
  return `/checkout/hosting?${serializeHostingPurchaseIntent(intent)}`;
}

export function signupPathForHostingIntent(
  intent: HostingPurchaseIntent,
): string {
  return `${routes.signup}?${serializeHostingPurchaseIntent(intent)}`;
}

export function loginPathForHostingIntent(
  intent: HostingPurchaseIntent,
): string {
  return `${routes.login}?${serializeHostingPurchaseIntent(intent)}`;
}

/** Preserve hosting purchase query keys when switching auth pages. */
export function preserveAuthSearchParams(
  searchParams: URLSearchParams,
): string {
  const intent = parseHostingPurchaseIntent(searchParams);
  if (intent) return serializeHostingPurchaseIntent(intent);
  return searchParams.toString();
}

export function resolvePostAuthRedirect(searchParams: URLSearchParams): string {
  const intent = parseHostingPurchaseIntent(searchParams);
  if (intent) return hostingCheckoutPath(intent);
  const next = searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return routes.account;
}
