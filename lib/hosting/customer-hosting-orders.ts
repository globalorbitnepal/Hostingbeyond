import { createHash } from "crypto";

import type { HostingOrder, HostingOrderStatus } from "@prisma/client";

import { listHostingOrdersForUser } from "@/lib/hosting/hosting-orders";
import {
  HOSTING_ORDER_STATUS_LABELS,
  hostingOrderImpliesProvisioned,
  hostingOrderIsLive,
} from "@/lib/hosting/provisioning";

export type CustomerHostingOrderSummary = {
  orderReference: string;
  productSlug: string;
  planKey: string;
  status: HostingOrderStatus;
  statusLabel: string;
  total: number;
  currency: string;
  billingCycle: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: string | null;
  isLive: boolean;
  isProvisioning: boolean;
  statusMessage: string;
};

export function hostingOrderCustomerReference(orderId: string): string {
  const digest = createHash("sha256")
    .update(orderId)
    .digest("hex")
    .slice(0, 10);
  return `HST-${digest.toUpperCase()}`;
}

export function customerMessageForHostingOrderStatus(
  status: HostingOrderStatus,
): string {
  if (status === "PENDING_PAYMENT") {
    return "Payment has not been confirmed yet. Complete checkout or wait for Stripe to confirm.";
  }
  if (status === "PAID") {
    return "Payment is confirmed. Hosting is not live until provisioning finishes.";
  }
  if (status === "PROVISIONING") {
    return "Payment succeeded and provisioning is in progress. Hosting is not active yet.";
  }
  if (status === "ACTIVE") {
    return "Hosting is active according to our order records.";
  }
  if (status === "FAILED") {
    return "This order failed during payment or provisioning.";
  }
  return HOSTING_ORDER_STATUS_LABELS[status] ?? status;
}

export function toCustomerHostingOrderSummary(
  order: HostingOrder,
): CustomerHostingOrderSummary {
  const status = order.status;
  return {
    orderReference: hostingOrderCustomerReference(order.id),
    productSlug: order.productSlug,
    planKey: order.planKey,
    status,
    statusLabel: HOSTING_ORDER_STATUS_LABELS[status] ?? status,
    total: Number(order.total),
    currency: order.currency,
    billingCycle: order.billingCycle,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paymentStatus: order.paymentStatus?.trim() || null,
    isLive: hostingOrderIsLive(status),
    isProvisioning:
      hostingOrderImpliesProvisioned(status) && !hostingOrderIsLive(status),
    statusMessage: customerMessageForHostingOrderStatus(status),
  };
}

export async function listCustomerHostingOrderSummaries(userId: string) {
  const rows = await listHostingOrdersForUser(userId);
  return rows.map(toCustomerHostingOrderSummary);
}

export async function getCustomerHostingOrderByReference(
  userId: string,
  orderReference: string,
) {
  const normalized = orderReference.trim().toUpperCase();
  if (!normalized) return null;
  const rows = await listHostingOrdersForUser(userId);
  const match = rows.find(
    (row) => hostingOrderCustomerReference(row.id) === normalized,
  );
  if (!match) return null;
  return toCustomerHostingOrderSummary(match);
}

export async function refreshHostingOrderStatusForCustomer(
  userId: string,
  orderReference: string,
) {
  return getCustomerHostingOrderByReference(userId, orderReference);
}
