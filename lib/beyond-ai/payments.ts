import type { BeyondAiPlanId } from "@/config/beyond-ai-product";

export type CheckoutResult =
  | { ok: true; mode: "free_activated"; redirectUrl: string }
  | { ok: true; mode: "dev_activated"; redirectUrl: string }
  | {
      ok: false;
      code: "payment_not_configured";
      message: string;
    }
  | { ok: false; code: "auth_required"; message: string };

/**
 * Dev-only activation bypass. Refuses to be enabled when the process is a
 * production build, so a stray `BEYOND_AI_DEV_ACTIVATE_PAID=true` in a real
 * environment cannot grant paid plans for free.
 */
export function isBeyondAiDevActivationAllowed(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NODE_ENV === "production") return false;
  return env.BEYOND_AI_DEV_ACTIVATE_PAID === "true";
}

/**
 * Stripe Checkout is not installed in this repo yet.
 * When STRIPE_SECRET_KEY and price IDs exist, create a session here.
 */
export async function createBeyondAiCheckout(
  _userId: string,
  planId: BeyondAiPlanId,
  env: Record<string, string | undefined> = process.env,
): Promise<CheckoutResult> {
  if (planId === "free") {
    return {
      ok: false,
      code: "auth_required",
      message: "Sign in to activate the free plan.",
    };
  }

  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    if (isBeyondAiDevActivationAllowed(env)) {
      return {
        ok: true,
        mode: "dev_activated",
        redirectUrl: `/beyond-ai/checkout/success?plan=${planId}&dev=1`,
      };
    }
    return {
      ok: false,
      code: "payment_not_configured",
      message:
        "Card payments are not configured yet. Set STRIPE_SECRET_KEY on the server or contact support to upgrade.",
    };
  }

  // TODO: stripe.checkout.sessions.create({ ... })
  return {
    ok: false,
    code: "payment_not_configured",
    message: "Stripe integration pending price configuration.",
  };
}
