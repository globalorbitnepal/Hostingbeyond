import type { HostingOrderStatus } from "@prisma/client";

import { HOSTING_ORDER_STATUS_LABELS } from "@/lib/hosting/provisioning";

export type CustomerHostingOrderView = {
  id: string;
  status: HostingOrderStatus;
  statusLabel: string;
  paymentStatus: string | null;
  provisioningPhase:
    | "awaiting_payment"
    | "paid_pending_activation"
    | "provisioning"
    | "active"
    | "failed"
    | "other";
  userMessage: string;
  productSlug: string;
  planKey: string;
  billingCycle: string;
  currency: string;
};

export function customerHostingProvisioningPhase(
  status: HostingOrderStatus,
): CustomerHostingOrderView["provisioningPhase"] {
  switch (status) {
    case "DRAFT":
    case "PENDING_PAYMENT":
      return "awaiting_payment";
    case "PAID":
      return "paid_pending_activation";
    case "PROVISIONING":
      return "provisioning";
    case "ACTIVE":
      return "active";
    case "FAILED":
      return "failed";
    default:
      return "other";
  }
}

export function customerHostingUserMessage(
  status: HostingOrderStatus,
  paymentStatus: string | null | undefined,
): string {
  if (status === "PAID" || status === "PROVISIONING") {
    if (paymentStatus === "succeeded") {
      return "Payment received. Your hosting is being set up — we will email you when it is ready.";
    }
  }
  if (status === "ACTIVE") {
    return "Your hosting is active.";
  }
  if (status === "FAILED") {
    return "Hosting setup could not be completed. Contact support for help.";
  }
  if (status === "PENDING_PAYMENT") {
    return "Complete payment to start hosting setup.";
  }
  return HOSTING_ORDER_STATUS_LABELS[status] ?? "Hosting order";
}

export function buildCustomerHostingOrderView(order: {
  id: string;
  status: HostingOrderStatus;
  paymentStatus: string | null;
  productSlug: string;
  planKey: string;
  billingCycle: string;
  currency: string;
}): CustomerHostingOrderView {
  return {
    id: order.id,
    status: order.status,
    statusLabel: HOSTING_ORDER_STATUS_LABELS[order.status],
    paymentStatus: order.paymentStatus,
    provisioningPhase: customerHostingProvisioningPhase(order.status),
    userMessage: customerHostingUserMessage(order.status, order.paymentStatus),
    productSlug: order.productSlug,
    planKey: order.planKey,
    billingCycle: order.billingCycle,
    currency: order.currency,
  };
}
