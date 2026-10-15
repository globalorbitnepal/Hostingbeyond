import type { DomainOrder } from "@prisma/client";

import { customerMessageForOrderStatus } from "@/lib/domains/notifications";
import { clampListLimit } from "@/lib/http/clamp-list-limit";
import { prisma } from "@/lib/prisma";

export type CustomerDomainOrderSummary = {
  publicId: string;
  domain: string;
  orderType: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  paymentMethod: "wallet" | "external" | "none";
  paymentReference: string | null;
  statusMessage: string;
};

function paymentMethodForOrder(
  order: DomainOrder,
): CustomerDomainOrderSummary["paymentMethod"] {
  if (order.walletTransactionId) return "wallet";
  if (order.paymentProvider?.trim()) return "external";
  return "none";
}

export function toCustomerDomainOrderSummary(
  order: DomainOrder,
): CustomerDomainOrderSummary {
  return {
    publicId: order.publicId,
    domain: order.domain,
    orderType: order.orderType,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    completedAt: order.completedAt?.toISOString() ?? null,
    paymentMethod: paymentMethodForOrder(order),
    paymentReference: order.paymentReference?.trim() || null,
    statusMessage: customerMessageForOrderStatus(order.status, order.orderType),
  };
}

export async function listCustomerDomainOrders(userId: string, limit = 50) {
  const take = clampListLimit(limit, 50, 100);
  const rows = await prisma.domainOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toCustomerDomainOrderSummary);
}

export async function getCustomerDomainOrderByPublicId(
  userId: string,
  publicId: string,
) {
  const order = await prisma.domainOrder.findFirst({
    where: { userId, publicId },
  });
  if (!order) return null;
  return toCustomerDomainOrderSummary(order);
}
