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
 * Stripe Checkout is not installed in this repo yet.
 * When STRIPE_SECRET_KEY and price IDs exist, create a session here.
 */
export async function createBeyondAiCheckout(
  _userId: string,
  planId: BeyondAiPlanId,
): Promise<CheckoutResult> {
  if (planId === "free") {
    return {
      ok: false,
      code: "auth_required",
      message: "Sign in to activate the free plan.",
    };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    if (process.env.BEYOND_AI_DEV_ACTIVATE_PAID === "true") {
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
