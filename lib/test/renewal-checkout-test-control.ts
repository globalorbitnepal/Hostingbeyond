import type { processDomainRenewalCheckout } from "@/lib/domains/renewal-service";

type CheckoutFn = typeof processDomainRenewalCheckout;

let override: CheckoutFn | null = null;

function testHooksEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Test-only. Not reachable from HTTP; setters are only used in `*.integration.test.ts`. */
export function setRenewalCheckoutTestOverride(fn: CheckoutFn | null) {
  if (!testHooksEnabled()) return;
  override = fn;
}

export function getRenewalCheckoutTestOverride(): CheckoutFn | null {
  if (!testHooksEnabled()) return null;
  return override;
}
