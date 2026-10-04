import type { HostingOrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { buildOrderSnapshot } from "./cart/snapshot";
import type { HostingCartQuote } from "./cart/types";

const DRAFT_TTL_HOURS = 72;

export type CreateHostingOrderInput = {
  userId: string | null;
  quote: HostingCartQuote;
  status?: HostingOrderStatus;
};

export async function upsertHostingDraftOrder(input: CreateHostingOrderInput) {
  const { quote, userId } = input;
  const status = input.status ?? "DRAFT";
  const expiresAt = new Date(Date.now() + DRAFT_TTL_HOURS * 60 * 60 * 1000);
  const snapshot = buildOrderSnapshot(quote);

  const data = {
    userId,
    status,
    productSlug: quote.configuration.productSlug,
    planKey: quote.configuration.planKey,
    billingCycle: quote.configuration.billingPeriod,
    configuration: quote.configuration as Prisma.InputJsonValue,
    lineItemsSnapshot: snapshot as Prisma.InputJsonValue,
    currency: quote.currency,
    subtotal: quote.subtotal,
    discount: quote.discount,
    tax: quote.tax,
    total: quote.total,
    expiresAt,
  };

  if (userId) {
    const existing = await prisma.hostingOrder.findFirst({
      where: {
        userId,
        productSlug: quote.configuration.productSlug,
        status: { in: ["DRAFT", "PENDING_PAYMENT"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) {
      return prisma.hostingOrder.update({
        where: { id: existing.id },
        data,
      });
    }
  }

  return prisma.hostingOrder.create({ data });
}

export async function listHostingOrdersForUser(userId: string) {
  try {
    return await prisma.hostingOrder.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  } catch {
    return [];
  }
}

export async function setHostingOrderStatus(
  orderId: string,
  status: HostingOrderStatus,
  userId?: string,
) {
  const order = await prisma.hostingOrder.findUnique({
    where: { id: orderId },
  });
  if (!order) return null;
  if (userId && order.userId && order.userId !== userId) return null;
  return prisma.hostingOrder.update({
    where: { id: orderId },
    data: { status },
  });
}

/** Reserved for Stripe phase — never set PAID from the browser. */
export async function attachPaymentToOrder(
  orderId: string,
  input: {
    paymentProvider: string;
    paymentReference: string;
    paymentStatus: string;
    paidAt?: Date;
  },
) {
  return prisma.hostingOrder.update({
    where: { id: orderId },
    data: {
      paymentProvider: input.paymentProvider,
      paymentReference: input.paymentReference,
      paymentStatus: input.paymentStatus,
      paidAt: input.paidAt ?? null,
      ...(input.paymentStatus === "succeeded"
        ? { status: "PAID" as const }
        : {}),
    },
  });
}
