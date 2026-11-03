/**
 * Pure wallet top-up checkout webhook planning (no DB, no Stripe SDK).
 */

export function walletStripeCreditIdempotencyKey(
  sessionId: string,
  paymentIntentId: string | null,
): string {
  return paymentIntentId
    ? `stripe:credit:${paymentIntentId}`
    : `stripe:session:${sessionId}`;
}

export type WalletCheckoutCompletedPlan =
  | { action: "skip_duplicate" }
  | { action: "reconcile"; creditKey: string }
  | { action: "credit"; creditKey: string };

/** Idempotent credit / duplicate skip before touching wallet balance. */
export function planWalletCheckoutCompletedAction(input: {
  paymentStatus: string;
  paymentWalletTransactionId: string | null;
  sessionId: string;
  paymentIntentId: string | null;
}): WalletCheckoutCompletedPlan {
  const creditKey = walletStripeCreditIdempotencyKey(
    input.sessionId,
    input.paymentIntentId,
  );

  if (input.paymentStatus === "SUCCEEDED" && input.paymentWalletTransactionId) {
    return { action: "skip_duplicate" };
  }

  if (
    input.paymentStatus === "SUCCEEDED" &&
    !input.paymentWalletTransactionId
  ) {
    return { action: "reconcile", creditKey };
  }

  return { action: "credit", creditKey };
}
