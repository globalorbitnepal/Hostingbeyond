import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, getStripeClient } from "@/lib/payments/stripe-config";
import {
  isPaymentProviderConfigured,
  type WebhookProcessResult,
} from "@/lib/payments/wallet-payment-service";
import { quoteHostingCart } from "@/lib/hosting/cart/pricing";
import type { HostingCartConfiguration } from "@/lib/hosting/cart/types";
import {
  decideHostingCheckoutCompletedWebhook,
  shouldMarkHostingCheckoutExpired,
  shouldMarkHostingCheckoutFailed,
} from "@/lib/hosting/hosting-order-checkout-policy";

export function isHostingCheckoutPaymentAvailable(): boolean {
  return isPaymentProviderConfigured();
}

export type HostingCheckoutVerificationResult =
  { ok: true; paidAmount: number } | { ok: false; reason: string };

/** Pure verification — webhook and unit tests. */
export function verifyPaidCheckoutForHostingOrder(
  session: {
    payment_status: string | null;
    metadata: Stripe.Metadata | null;
    amount_total: number | null;
    currency: string | null;
  },
  order: {
    id: string;
    userId: string | null;
    total: { toString(): string } | number;
    currency: string;
  },
): HostingCheckoutVerificationResult {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not_paid" };
  }
  const metaOrderId = session.metadata?.hostingOrderId;
  if (!metaOrderId || metaOrderId !== order.id) {
    return { ok: false, reason: "order_mismatch" };
  }
  const metaUserId = session.metadata?.userId;
  if (!order.userId || !metaUserId || metaUserId !== order.userId) {
    return { ok: false, reason: "customer_mismatch" };
  }
  if (session.amount_total == null) {
    return { ok: false, reason: "missing_amount" };
  }
  const paidAmount = session.amount_total / 100;
  const expected = Number(order.total);
  if (Math.abs(paidAmount - expected) > 0.001) {
    return { ok: false, reason: "amount_mismatch" };
  }
  const currency = (session.currency ?? "usd").toUpperCase();
  if (currency !== order.currency.toUpperCase()) {
    return { ok: false, reason: "currency_mismatch" };
  }
  return { ok: true, paidAmount: expected };
}

const PAYABLE_STATUSES = new Set(["DRAFT", "PENDING_PAYMENT"]);

export type StripeCheckoutSessionCreate = (
  params: Stripe.Checkout.SessionCreateParams,
  options?: Stripe.RequestOptions,
) => Promise<Stripe.Checkout.Session>;

export type StripeCheckoutSessionRetrieve = (
  id: string,
) => Promise<Stripe.Checkout.Session>;

function stripeIdempotencyKeyForCheckout(
  checkoutRowId: string,
  clientKey: string,
): string {
  const raw = `hosting-co:${checkoutRowId}:${clientKey}`;
  return raw.length > 255 ? raw.slice(0, 255) : raw;
}

async function lockHostingOrderCheckout(
  tx: Prisma.TransactionClient,
  hostingOrderId: string,
): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${hostingOrderId}))`;
}

async function recoverOpenCheckoutUrl(
  stripeCheckoutSessionId: string,
  retrieve: StripeCheckoutSessionRetrieve,
): Promise<string | null> {
  const session = await retrieve(stripeCheckoutSessionId);
  if (session.status === "open" && session.url) {
    return session.url;
  }
  return null;
}

export async function createHostingOrderStripeCheckout(
  input: {
    orderId: string;
    userId: string;
    idempotencyKey: string;
  },
  deps?: {
    createSession?: StripeCheckoutSessionCreate;
    retrieveSession?: StripeCheckoutSessionRetrieve;
  },
): Promise<
  | { ok: true; checkoutUrl: string }
  | { ok: false; status: number; error: string }
> {
  if (!isHostingCheckoutPaymentAvailable()) {
    return {
      ok: false,
      status: 503,
      error:
        "Online payment for hosting is not configured yet. Contact support to complete your order.",
    };
  }

  const stripe = getStripeClient();
  const createSession =
    deps?.createSession ??
    ((params, options) => stripe.checkout.sessions.create(params, options));
  const retrieveSession =
    deps?.retrieveSession ?? ((id) => stripe.checkout.sessions.retrieve(id));

  try {
    return await prisma.$transaction(async (tx) => {
      await lockHostingOrderCheckout(tx, input.orderId);

      const order = await tx.hostingOrder.findFirst({
        where: { id: input.orderId, userId: input.userId },
      });
      if (!order) {
        return { ok: false, status: 404, error: "Order not found." };
      }
      if (order.status === "PAID") {
        return {
          ok: false,
          status: 409,
          error: "This order is already paid.",
        };
      }
      if (!PAYABLE_STATUSES.has(order.status)) {
        return {
          ok: false,
          status: 400,
          error: "This order cannot be paid in its current state.",
        };
      }

      const configuration = order.configuration as HostingCartConfiguration;
      const quote = await quoteHostingCart({
        ...configuration,
        productSlug: configuration.productSlug,
        planKey: configuration.planKey,
      });
      if (quote.errors.length > 0) {
        return {
          ok: false,
          status: 400,
          error: quote.errors.join(" "),
        };
      }
      if (Math.abs(quote.total - Number(order.total)) > 0.01) {
        return {
          ok: false,
          status: 409,
          error: "Order pricing is out of date. Please restart checkout.",
        };
      }

      const openCheckout = await tx.hostingOrderCheckout.findFirst({
        where: {
          hostingOrderId: order.id,
          status: "CHECKOUT_CREATED",
        },
      });
      if (openCheckout?.stripeCheckoutSessionId) {
        const openUrl = await recoverOpenCheckoutUrl(
          openCheckout.stripeCheckoutSessionId,
          retrieveSession,
        );
        if (openUrl) {
          return { ok: true, checkoutUrl: openUrl };
        }
        await tx.hostingOrderCheckout.update({
          where: { id: openCheckout.id },
          data: { status: "EXPIRED", failureReason: "checkout_not_open" },
        });
      }

      let checkoutRow = await tx.hostingOrderCheckout.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (!checkoutRow) {
        checkoutRow = await tx.hostingOrderCheckout.create({
          data: {
            hostingOrderId: order.id,
            userId: input.userId,
            idempotencyKey: input.idempotencyKey,
            status: "PENDING",
          },
        });
      } else if (checkoutRow.hostingOrderId !== order.id) {
        return { ok: false, status: 409, error: "Idempotency key conflict." };
      }

      if (
        checkoutRow.stripeCheckoutSessionId &&
        checkoutRow.status === "CHECKOUT_CREATED"
      ) {
        const url = await recoverOpenCheckoutUrl(
          checkoutRow.stripeCheckoutSessionId,
          retrieveSession,
        );
        if (url) {
          return { ok: true, checkoutUrl: url };
        }
        await tx.hostingOrderCheckout.update({
          where: { id: checkoutRow.id },
          data: { status: "EXPIRED", failureReason: "checkout_not_open" },
        });
        checkoutRow = await tx.hostingOrderCheckout.findUniqueOrThrow({
          where: { id: checkoutRow.id },
        });
      }

      const base = getAppBaseUrl();
      const amountCents = Math.round(Number(order.total) * 100);
      const snap = order.lineItemsSnapshot as { planName?: string } | null;
      const productLabel =
        snap?.planName ?? `${order.productSlug} · ${order.planKey}`;

      const session = await createSession(
        {
          mode: "payment",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: order.currency.toLowerCase(),
                unit_amount: amountCents,
                product_data: {
                  name: `HostingBeyond — ${productLabel}`,
                  description: `Web hosting order (${order.billingCycle})`,
                },
              },
            },
          ],
          metadata: {
            purpose: "hosting_order",
            hostingOrderId: order.id,
            userId: input.userId,
            hostingCheckoutId: checkoutRow.id,
            idempotencyKey: input.idempotencyKey,
          },
          success_url: `${base}/account/hosting-orders?payment=processing&order=${order.id}`,
          cancel_url: `${base}/account/hosting-orders?payment=cancelled&order=${order.id}`,
        },
        {
          idempotencyKey: stripeIdempotencyKeyForCheckout(
            checkoutRow.id,
            input.idempotencyKey,
          ),
        },
      );

      if (!session.url) {
        return {
          ok: false,
          status: 502,
          error: "Could not start payment checkout. Please try again.",
        };
      }

      await tx.hostingOrderCheckout.update({
        where: { id: checkoutRow.id },
        data: {
          status: "CHECKOUT_CREATED",
          stripeCheckoutSessionId: session.id,
        },
      });

      await tx.hostingOrder.update({
        where: { id: order.id },
        data: {
          status: "PENDING_PAYMENT",
          paymentProvider: "stripe",
          paymentReference: session.id,
          paymentStatus: "checkout_created",
        },
      });

      return { ok: true, checkoutUrl: session.url };
    });
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    if (code === "P2002") {
      const existing = await prisma.hostingOrderCheckout.findFirst({
        where: {
          hostingOrderId: input.orderId,
          status: "CHECKOUT_CREATED",
        },
      });
      if (existing?.stripeCheckoutSessionId) {
        const url = await recoverOpenCheckoutUrl(
          existing.stripeCheckoutSessionId,
          retrieveSession,
        );
        if (url) {
          return { ok: true, checkoutUrl: url };
        }
      }
      return {
        ok: false,
        status: 409,
        error: "A payment session is already in progress for this order.",
      };
    }
    throw err;
  }
}

/** Marks order PAID only — not ACTIVE (no provisioning adapter). */
export async function handleHostingOrderCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  const orderId = session.metadata?.hostingOrderId;
  if (!orderId) {
    return { ok: true, handled: false };
  }

  const order = await prisma.hostingOrder.findUnique({
    where: { id: orderId },
  });
  if (!order) {
    return { ok: false, error: "Unknown hosting order", status: 400 };
  }

  const checkoutRow = session.id
    ? await prisma.hostingOrderCheckout.findFirst({
        where: {
          hostingOrderId: order.id,
          stripeCheckoutSessionId: session.id,
        },
      })
    : null;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const verified = verifyPaidCheckoutForHostingOrder(session, order);
  const decision = decideHostingCheckoutCompletedWebhook({
    orderStatus: order.status,
    orderPaymentStatus: order.paymentStatus,
    orderPaidPaymentReference: order.paymentReference,
    sessionId: session.id,
    paymentIntentId,
    registeredCheckout: checkoutRow
      ? {
          id: checkoutRow.id,
          status: checkoutRow.status,
          stripeCheckoutSessionId: checkoutRow.stripeCheckoutSessionId,
        }
      : null,
    verification: verified,
  });

  if (decision.action === "duplicate") {
    return { ok: true, handled: true, duplicate: true };
  }

  if (decision.action === "reject_already_paid") {
    return { ok: false, error: decision.reason, status: 409 };
  }

  if (decision.action === "reject") {
    if (order.status !== "PAID") {
      await prisma.hostingOrder.updateMany({
        where: { id: order.id, status: { not: "PAID" } },
        data: {
          paymentProvider: "stripe",
          paymentReference: session.id,
          paymentStatus: `failed:${decision.reason}`,
        },
      });
      if (checkoutRow && checkoutRow.status !== "COMPLETED") {
        await prisma.hostingOrderCheckout.updateMany({
          where: { id: checkoutRow.id, status: { not: "COMPLETED" } },
          data: {
            status: "FAILED",
            failureReason: decision.reason,
          },
        });
      }
    }
    return { ok: false, error: decision.reason, status: 400 };
  }

  const paidRef = paymentIntentId ?? session.id;
  const updated = await prisma.$transaction(async (tx) => {
    const marked = await tx.hostingOrder.updateMany({
      where: {
        id: order.id,
        status: { in: ["DRAFT", "PENDING_PAYMENT"] },
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentProvider: "stripe",
        paymentReference: paidRef,
        paymentStatus: "succeeded",
      },
    });
    if (marked.count === 0) {
      const current = await tx.hostingOrder.findUnique({
        where: { id: order.id },
      });
      if (current?.status === "PAID" && current.paymentStatus === "succeeded") {
        return "duplicate" as const;
      }
      return "conflict" as const;
    }
    if (checkoutRow) {
      await tx.hostingOrderCheckout.update({
        where: { id: checkoutRow.id },
        data: {
          status: "COMPLETED",
          stripePaymentIntentId: paymentIntentId,
        },
      });
      await tx.hostingOrderCheckout.updateMany({
        where: {
          hostingOrderId: order.id,
          status: "CHECKOUT_CREATED",
          id: { not: checkoutRow.id },
        },
        data: {
          status: "CANCELLED",
          failureReason: "superseded_by_payment",
        },
      });
    }
    return "paid" as const;
  });

  if (updated === "duplicate") {
    return { ok: true, handled: true, duplicate: true };
  }
  if (updated === "conflict") {
    return { ok: false, error: "order_state_conflict", status: 409 };
  }

  return { ok: true, handled: true };
}

export async function handleHostingOrderCheckoutExpired(
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  const orderId = session.metadata?.hostingOrderId;
  if (!orderId) {
    return { ok: true, handled: false };
  }

  const order = await prisma.hostingOrder.findUnique({
    where: { id: orderId },
  });
  if (!order) {
    return { ok: true, handled: false };
  }

  const checkoutRow = await prisma.hostingOrderCheckout.findFirst({
    where: {
      hostingOrderId: order.id,
      stripeCheckoutSessionId: session.id,
    },
  });
  if (!checkoutRow) {
    return { ok: true, handled: false };
  }

  if (
    !shouldMarkHostingCheckoutExpired({
      orderStatus: order.status,
      checkoutStatus: checkoutRow.status,
    })
  ) {
    return { ok: true, handled: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.hostingOrderCheckout.update({
      where: { id: checkoutRow.id },
      data: { status: "EXPIRED", failureReason: "checkout_expired" },
    });
    await tx.hostingOrder.updateMany({
      where: {
        id: order.id,
        status: { in: ["DRAFT", "PENDING_PAYMENT"] },
        paymentReference: session.id,
      },
      data: {
        paymentStatus: "checkout_expired",
      },
    });
  });

  return { ok: true, handled: true };
}

export async function handleHostingOrderPaymentIntentFailed(
  intent: Stripe.PaymentIntent,
): Promise<WebhookProcessResult> {
  let checkoutRow = intent.metadata?.hostingCheckoutId
    ? await prisma.hostingOrderCheckout.findUnique({
        where: { id: intent.metadata.hostingCheckoutId },
      })
    : null;
  if (!checkoutRow && intent.metadata?.hostingOrderId) {
    checkoutRow = await prisma.hostingOrderCheckout.findFirst({
      where: {
        hostingOrderId: intent.metadata.hostingOrderId,
        status: "CHECKOUT_CREATED",
      },
      orderBy: { createdAt: "desc" },
    });
  }
  if (!checkoutRow) {
    checkoutRow = await prisma.hostingOrderCheckout.findFirst({
      where: { stripePaymentIntentId: intent.id },
    });
  }
  if (!checkoutRow) {
    return { ok: true, handled: false };
  }

  const order = await prisma.hostingOrder.findUnique({
    where: { id: checkoutRow.hostingOrderId },
  });
  if (!order) {
    return { ok: true, handled: false };
  }

  if (
    !shouldMarkHostingCheckoutFailed({
      orderStatus: order.status,
      checkoutStatus: checkoutRow.status,
    })
  ) {
    return { ok: true, handled: true };
  }

  const reason = intent.last_payment_error?.message ?? "payment_failed";

  await prisma.$transaction(async (tx) => {
    await tx.hostingOrderCheckout.update({
      where: { id: checkoutRow.id },
      data: { status: "FAILED", failureReason: reason },
    });
    if (checkoutRow.stripeCheckoutSessionId) {
      await tx.hostingOrder.updateMany({
        where: {
          id: order.id,
          status: { in: ["DRAFT", "PENDING_PAYMENT"] },
          paymentReference: checkoutRow.stripeCheckoutSessionId,
        },
        data: { paymentStatus: `failed:${reason}` },
      });
    }
  });

  return { ok: true, handled: true };
}
