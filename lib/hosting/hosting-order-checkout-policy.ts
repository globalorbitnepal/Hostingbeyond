export type HostingWebhookDecision =
  | { action: "duplicate" }
  | { action: "accept" }
  | { action: "reject"; reason: string }
  | { action: "reject_already_paid"; reason: string };

/** Pure webhook routing — unit-tested. */
export function decideHostingCheckoutCompletedWebhook(input: {
  orderStatus: string;
  orderPaymentStatus: string | null;
  orderPaidPaymentReference: string | null;
  sessionId: string;
  paymentIntentId: string | null;
  registeredCheckout: {
    id: string;
    status: string;
    stripeCheckoutSessionId: string | null;
  } | null;
  verification: { ok: true } | { ok: false; reason: string };
}): HostingWebhookDecision {
  const paidRef = input.paymentIntentId ?? input.sessionId;

  if (
    input.orderStatus === "PAID" &&
    input.orderPaymentStatus === "succeeded"
  ) {
    if (
      input.orderPaidPaymentReference &&
      paidRef &&
      input.orderPaidPaymentReference === paidRef
    ) {
      return { action: "duplicate" };
    }
    return {
      action: "reject_already_paid",
      reason: "order_already_paid",
    };
  }

  if (input.orderStatus === "PAID") {
    return { action: "duplicate" };
  }

  if (!input.registeredCheckout) {
    return { action: "reject", reason: "unknown_checkout_session" };
  }

  if (input.registeredCheckout.stripeCheckoutSessionId !== input.sessionId) {
    return { action: "reject", reason: "session_not_registered" };
  }

  if (
    input.registeredCheckout.status === "COMPLETED" &&
    input.orderStatus === "PAID"
  ) {
    return { action: "duplicate" };
  }

  if (input.verification.ok === false) {
    return { action: "reject", reason: input.verification.reason };
  }

  return { action: "accept" };
}

export function shouldMarkHostingCheckoutExpired(input: {
  orderStatus: string;
  checkoutStatus: string;
}): boolean {
  if (input.orderStatus === "PAID") return false;
  return (
    input.checkoutStatus === "CHECKOUT_CREATED" ||
    input.checkoutStatus === "PENDING"
  );
}

export function shouldMarkHostingCheckoutFailed(input: {
  orderStatus: string;
  checkoutStatus: string;
}): boolean {
  if (input.orderStatus === "PAID") return false;
  return (
    input.checkoutStatus === "CHECKOUT_CREATED" ||
    input.checkoutStatus === "PENDING"
  );
}
