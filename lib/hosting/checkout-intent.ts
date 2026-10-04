import { routes } from "@/config/routes";

import type { HostingCartConfiguration } from "./cart/types";
import { HOSTING_CART_STORAGE_KEY } from "./cart/types";
import {
  hostingCheckoutPath,
  type HostingPurchaseIntent,
  parseHostingPurchaseIntent,
  serializeHostingPurchaseIntent,
  validateHostingPurchaseIntentSync,
} from "./purchase-intent";

/**
 * Typed checkout intent: URL carries product/plan/billing for auth redirects;
 * full cart configuration is stored client-side until payment phase.
 */
export type HostingCheckoutIntent = {
  purchase: HostingPurchaseIntent;
  configuration?: Partial<HostingCartConfiguration>;
};

export function buildCheckoutIntentFromSearchParams(
  params: URLSearchParams,
): HostingCheckoutIntent | null {
  const purchase = parseHostingPurchaseIntent(params);
  if (!purchase) return null;
  return { purchase };
}

export function checkoutPathFromIntent(intent: HostingCheckoutIntent): string {
  return hostingCheckoutPath(intent.purchase);
}

export function signupPathForCheckout(intent: HostingCheckoutIntent): string {
  return `${routes.signup}?${serializeHostingPurchaseIntent(intent.purchase)}`;
}

export function loginPathForCheckout(intent: HostingCheckoutIntent): string {
  return `${routes.login}?${serializeHostingPurchaseIntent(intent.purchase)}`;
}

/** Post-auth: return to cart; client rehydrates configuration from sessionStorage. */
export function resolvePostAuthCheckoutRedirect(
  searchParams: URLSearchParams,
): string {
  const intent = parseHostingPurchaseIntent(searchParams);
  if (intent && validateHostingPurchaseIntentSync(intent)) {
    return hostingCheckoutPath(intent);
  }
  const next = searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return routes.account;
}

export const CHECKOUT_CART_STORAGE_KEY = HOSTING_CART_STORAGE_KEY;

/** OAuth `next` should point here so Google/GitHub can be wired without flow changes. */
export function oauthNextForCheckout(intent: HostingPurchaseIntent): string {
  return hostingCheckoutPath(intent);
}
