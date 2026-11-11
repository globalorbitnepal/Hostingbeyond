import type Stripe from "stripe";

import { publicId } from "@/lib/domains/transfer-service";
import {
  creditWallet,
  debitWalletIfSufficient,
  ensureCustomerWallet,
} from "@/lib/domains/wallet";
import { prisma } from "@/lib/prisma";
import {
  constructStripeWebhookEvent,
  getAppBaseUrl,
  getStripeClient,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/lib/payments/stripe-config";
import {
  fromProviderMinorUnits,
  toProviderMinorUnits,
} from "@/lib/payments/settlement-currency";

export type TopUpSessionResult =
  | {
      ok: true;
      checkoutUrl: string;
      paymentPublicId: string;
      status: "checkout_created";
    }
  | { ok: false; status: "provider_pending"; message: string };

export function normalizeTopUpAmount(raw: number): number | null {
  if (!Number.isFinite(raw)) return null;
  const rounded = Math.round(raw * 100) / 100;
  if (rounded < 5 || rounded > 10_000) return null;
  return rounded;
}

/**
 * Admin ledger adjustments are not customer top-ups: a goodwill credit of
 * $1.50 or removing $0.40 is legitimate, so the $5 floor does not apply.
 */
export function normalizeAdminWalletAmount(raw: number): number | null {
  if (!Number.isFinite(raw)) return null;
  const rounded = Math.round(raw * 100) / 100;
  if (rounded < 0.01 || rounded > 10_000) return null;
  return rounded;
}

export function isPaymentProviderConfigured(): boolean {
  return isStripeConfigured() && Boolean(getStripeWebhookSecret());
}

/**
 * Wallet top-up is a USD ledger (domain costs settle in USD), so the charge
 * currency stays USD regardless of the storefront display currency.
 */
export async function createWalletTopUpCheckoutSession(input: {
  userId: string;
  amount: number;
  idempotencyKey: string;
}): Promise<TopUpSessionResult> {
  const currency = "USD";
  const amount = normalizeTopUpAmount(input.amount);
  if (amount == null) {
    return {
      ok: false,
      status: "provider_pending",
      message: "Enter an amount between $5 and $10,000.",
    };
  }

  if (!isPaymentProviderConfigured()) {
    return {
      ok: false,
      status: "provider_pending",
      message:
        "Wallet top-up is not connected to a verified payment provider yet. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on the server.",
    };
  }

  await ensureCustomerWallet(input.userId);

  const existingPayment = await prisma.walletPayment.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existingPayment?.providerCheckoutSessionId) {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(
      existingPayment.providerCheckoutSessionId,
    );
    if (session.url && session.status === "open") {
      return {
        ok: true,
        checkoutUrl: session.url,
        paymentPublicId: existingPayment.publicId,
        status: "checkout_created",
      };
    }
  }

  const payment = await prisma.walletPayment.create({
    data: {
      publicId: publicId("WLT"),
      userId: input.userId,
      amount,
      currency,
      status: "PENDING",
      idempotencyKey: input.idempotencyKey,
    },
  });

  const base = getAppBaseUrl();
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: toProviderMinorUnits(amount, currency),
          product_data: {
            name: "HostingBeyond wallet top-up",
            description: "Add funds for domain registrations and renewals",
          },
        },
      },
    ],
    metadata: {
      walletPaymentId: payment.id,
      userId: input.userId,
      idempotencyKey: input.idempotencyKey,
    },
    success_url: `${base}/account/wallet?topup=processing&payment=${payment.publicId}`,
    cancel_url: `${base}/account/wallet?topup=cancelled&payment=${payment.publicId}`,
  });

  await prisma.walletPayment.update({
    where: { id: payment.id },
    data: {
      status: "CHECKOUT_CREATED",
      providerCheckoutSessionId: session.id,
    },
  });

  if (!session.url) {
    return {
      ok: false,
      status: "provider_pending",
      message: "Could not start payment checkout. Please try again.",
    };
  }

  return {
    ok: true,
    checkoutUrl: session.url,
    paymentPublicId: payment.publicId,
    status: "checkout_created",
  };
}

export type WebhookProcessResult =
  | { ok: true; handled: boolean; duplicate?: boolean }
  | { ok: false; error: string; status: number };

export async function processStripeWalletWebhook(input: {
  rawBody: string;
  signature: string | null;
  constructEvent?: typeof constructStripeWebhookEvent;
}): Promise<WebhookProcessResult> {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    return { ok: false, error: "Webhook not configured", status: 503 };
  }
  if (!input.signature) {
    return { ok: false, error: "Missing signature", status: 400 };
  }

  const construct = input.constructEvent ?? constructStripeWebhookEvent;
  let event: Stripe.Event;
  try {
    event = construct(input.rawBody, input.signature, webhookSecret);
  } catch {
    return { ok: false, error: "Invalid signature", status: 400 };
  }

  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
    case "checkout.session.expired":
      return handleCheckoutSessionExpired(
        event.data.object as Stripe.Checkout.Session,
      );
    case "payment_intent.payment_failed":
      return handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent,
      );
    default:
      return { ok: true, handled: false };
  }
}

async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  if (session.metadata?.hostingOrderId) {
    const { handleHostingOrderCheckoutExpired } =
      await import("@/lib/hosting/hosting-order-stripe-payment");
    return handleHostingOrderCheckoutExpired(session);
  }

  const payment = await findPaymentBySession(session);
  if (!payment || payment.status === "SUCCEEDED") {
    return { ok: true, handled: Boolean(payment) };
  }
  await prisma.walletPayment.update({
    where: { id: payment.id },
    data: { status: "CANCELLED", failureReason: "checkout_expired" },
  });
  return { ok: true, handled: true };
}

async function handlePaymentIntentFailed(
  intent: Stripe.PaymentIntent,
): Promise<WebhookProcessResult> {
  if (intent.metadata?.hostingOrderId || intent.metadata?.hostingCheckoutId) {
    const { handleHostingOrderPaymentIntentFailed } =
      await import("@/lib/hosting/hosting-order-stripe-payment");
    const hosting = await handleHostingOrderPaymentIntentFailed(intent);
    if (hosting.ok && hosting.handled) {
      return hosting;
    }
  }

  const payment = await prisma.walletPayment.findFirst({
    where: { providerPaymentIntentId: intent.id },
  });
  if (!payment) {
    return { ok: true, handled: false };
  }
  if (payment.status === "SUCCEEDED") {
    return { ok: true, handled: true };
  }
  await prisma.walletPayment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      failureReason: intent.last_payment_error?.message ?? "payment_failed",
    },
  });
  return { ok: true, handled: true };
}

async function findPaymentBySession(session: Stripe.Checkout.Session) {
  const walletPaymentId = session.metadata?.walletPaymentId;
  if (walletPaymentId) {
    return prisma.walletPayment.findUnique({ where: { id: walletPaymentId } });
  }
  if (session.id) {
    return prisma.walletPayment.findUnique({
      where: { providerCheckoutSessionId: session.id },
    });
  }
  return null;
}

export type CheckoutVerificationResult =
  { ok: true; paidAmount: number } | { ok: false; reason: string };

/** Pure verification — used by webhook handler and unit tests. */
export function verifyPaidCheckoutForWallet(
  session: {
    payment_status: string | null;
    metadata: Stripe.Metadata | null;
    amount_total: number | null;
    currency: string | null;
  },
  payment: {
    userId: string;
    amount: { toString(): string } | number;
    currency: string;
  },
): CheckoutVerificationResult {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not_paid" };
  }
  const metaUserId = session.metadata?.userId;
  if (!metaUserId || metaUserId !== payment.userId) {
    return { ok: false, reason: "customer_mismatch" };
  }
  if (session.amount_total == null) {
    return { ok: false, reason: "missing_amount" };
  }
  const currency = (session.currency ?? "usd").toUpperCase();
  const paidAmount = fromProviderMinorUnits(session.amount_total, currency);
  const expected = Number(payment.amount);
  if (Math.abs(paidAmount - expected) > 0.001) {
    return { ok: false, reason: "amount_mismatch" };
  }
  if (currency !== payment.currency.toUpperCase()) {
    return { ok: false, reason: "currency_mismatch" };
  }
  return { ok: true, paidAmount: expected };
}

/** Credits wallet only after Stripe session + amount + customer verified. */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  if (session.metadata?.hostingOrderId) {
    const { handleHostingOrderCheckoutCompleted } =
      await import("@/lib/hosting/hosting-order-stripe-payment");
    return handleHostingOrderCheckoutCompleted(session);
  }

  if (session.metadata?.kind === "ssl_certificate") {
    const { handleSslCheckoutCompleted } =
      await import("@/lib/panel/ssl-checkout");
    return handleSslCheckoutCompleted(session);
  }

  if (
    session.mode === "setup" ||
    session.metadata?.kind === "customer_card_setup"
  ) {
    return { ok: true, handled: true };
  }

  const payment = await findPaymentBySession(session);
  if (!payment) {
    return { ok: false, error: "Unknown payment", status: 400 };
  }

  const verified = verifyPaidCheckoutForWallet(session, payment);
  if (!verified.ok) {
    await prisma.walletPayment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason: verified.reason,
      },
    });
    const status = verified.reason === "customer_mismatch" ? 400 : 400;
    return { ok: false, error: verified.reason, status };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  if (payment.status === "SUCCEEDED" && payment.walletTransactionId) {
    return { ok: true, handled: true, duplicate: true };
  }

  const creditKey = paymentIntentId
    ? `stripe:credit:${paymentIntentId}`
    : `stripe:session:${session.id}`;

  const tx = await creditWallet({
    userId: payment.userId,
    amount: verified.paidAmount,
    idempotencyKey: creditKey,
    note: "Verified Stripe wallet top-up",
    referenceType: "WalletPayment",
    referenceId: payment.id,
  });

  await prisma.walletPayment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCEEDED",
      providerCheckoutSessionId: session.id,
      providerPaymentIntentId: paymentIntentId,
      walletTransactionId: tx.id,
      completedAt: new Date(),
    },
  });

  return { ok: true, handled: true };
}

export async function listWalletTransactionsForUser(
  userId: string,
  limit = 50,
) {
  return prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listWalletPaymentsForUser(userId: string, limit = 30) {
  return prisma.walletPayment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getWalletPaymentForUser(
  userId: string,
  publicId: string,
) {
  return prisma.walletPayment.findFirst({
    where: { userId, publicId },
  });
}

export async function searchCustomersForWalletAdmin(query: string) {
  const q = query.trim();
  return prisma.customerUser.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { wallet: true },
  });
}

export async function adminAdjustCustomerWallet(input: {
  adminUserId: string;
  userId: string;
  direction: "credit" | "debit";
  amount: number;
  reason: string;
  idempotencyKey: string;
}) {
  const amount = normalizeAdminWalletAmount(input.amount);
  if (amount == null) throw new Error("invalid_amount");
  if (!input.reason.trim()) throw new Error("reason_required");

  await ensureCustomerWallet(input.userId);

  if (input.direction === "credit") {
    const tx = await creditWallet({
      userId: input.userId,
      amount,
      idempotencyKey: `admin:${input.idempotencyKey}`,
      note: `Admin credit: ${input.reason.trim()}`,
      referenceType: "admin_adjustment",
      referenceId: input.adminUserId,
    });
    await prisma.domainAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: "WALLET_ADMIN_CREDIT",
        resource: "CustomerWallet",
        resourceId: input.userId,
        details: { amount, walletTransactionId: tx.id, reason: input.reason },
      },
    });
    return tx;
  }

  return adminDebitWallet(input);
}

async function adminDebitWallet(input: {
  adminUserId: string;
  userId: string;
  amount: number;
  reason: string;
  idempotencyKey: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.walletTransaction.findUnique({
      where: { idempotencyKey: `admin:${input.idempotencyKey}` },
    });
    if (existing) return existing;

    const wallet = await debitWalletIfSufficient(
      tx,
      input.userId,
      input.amount,
    );
    const walletTx = await tx.walletTransaction.create({
      data: {
        userId: input.userId,
        type: "DEBIT",
        status: "COMPLETED",
        amount: input.amount,
        balanceAfter: wallet.balance,
        idempotencyKey: `admin:${input.idempotencyKey}`,
        referenceType: "admin_adjustment",
        referenceId: input.adminUserId,
        note: `Admin debit: ${input.reason.trim()}`,
      },
    });
    await tx.domainAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: "WALLET_ADMIN_DEBIT",
        resource: "CustomerWallet",
        resourceId: input.userId,
        details: {
          amount: input.amount,
          walletTransactionId: walletTx.id,
          reason: input.reason,
        },
      },
    });
    return walletTx;
  });
}

export async function adminReverseWalletCredit(input: {
  adminUserId: string;
  walletTransactionId: string;
  reason: string;
  idempotencyKey: string;
}) {
  const original = await prisma.walletTransaction.findUnique({
    where: { id: input.walletTransactionId },
  });
  if (
    !original ||
    original.type !== "CREDIT" ||
    original.status !== "COMPLETED"
  ) {
    throw new Error("invalid_credit_tx");
  }

  return prisma.$transaction(async (tx) => {
    const reversalKey = `admin:reversal:${input.idempotencyKey}`;
    const existing = await tx.walletTransaction.findUnique({
      where: { idempotencyKey: reversalKey },
    });
    if (existing) return existing;

    const wallet = await debitWalletIfSufficient(
      tx,
      original.userId,
      original.amount,
    );
    const reversal = await tx.walletTransaction.create({
      data: {
        userId: original.userId,
        type: "REFUND",
        status: "COMPLETED",
        amount: original.amount,
        balanceAfter: wallet.balance,
        idempotencyKey: reversalKey,
        referenceType: "wallet_reversal",
        referenceId: original.id,
        note: `Admin reversal: ${input.reason.trim()}`,
      },
    });
    await tx.domainAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: "WALLET_ADMIN_REVERSAL",
        resource: "WalletTransaction",
        resourceId: original.id,
        details: { reversalId: reversal.id, reason: input.reason },
      },
    });
    return reversal;
  });
}
