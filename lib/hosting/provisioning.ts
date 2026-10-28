import type { HostingOrderStatus } from "@prisma/client";

/**
 * Hosting payment is not provisioning. PAID means money was confirmed.
 * ACTIVE is reserved for a future provider adapter.
 */

export const HOSTING_ORDER_STATUS_LABELS: Record<HostingOrderStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Pending payment",
  PAID: "Paid — awaiting activation",
  PROVISIONING: "Provisioning",
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
  EXPIRED: "Expired",
};

const ALLOWED_TRANSITIONS: Record<HostingOrderStatus, HostingOrderStatus[]> = {
  DRAFT: ["PENDING_PAYMENT", "CANCELLED", "EXPIRED"],
  PENDING_PAYMENT: ["PAID", "CANCELLED", "EXPIRED", "FAILED"],
  PAID: ["PROVISIONING", "CANCELLED", "FAILED"],
  PROVISIONING: ["ACTIVE", "FAILED", "CANCELLED"],
  ACTIVE: ["CANCELLED"],
  CANCELLED: [],
  FAILED: ["PENDING_PAYMENT", "CANCELLED"],
  EXPIRED: [],
};

export function hostingOrderIsLive(status: HostingOrderStatus): boolean {
  return status === "ACTIVE";
}

export function hostingOrderImpliesProvisioned(
  status: HostingOrderStatus,
): boolean {
  return status === "ACTIVE" || status === "PROVISIONING";
}

export function canTransitionHostingOrderStatus(
  from: HostingOrderStatus,
  to: HostingOrderStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) === true;
}

export type HostingProvisionRequest = {
  orderId: string;
  status: HostingOrderStatus;
};

export type HostingProvisionResult =
  | { ok: true; nextStatus: "PROVISIONING" }
  | {
      ok: false;
      reason:
        | "order_not_paid"
        | "already_provisioning"
        | "already_active"
        | "provisioner_not_configured"
        | "terminal_status";
      nextStatus: null;
    };

export type HostingProvisioner = {
  requestProvision(
    request: HostingProvisionRequest,
  ): Promise<HostingProvisionResult>;
};

/** Safe default: never creates servers, mailboxes, or registrar side effects. */
export const noopHostingProvisioner: HostingProvisioner = {
  async requestProvision(request) {
    if (request.status === "ACTIVE") {
      return { ok: false, reason: "already_active", nextStatus: null };
    }
    if (request.status === "PROVISIONING") {
      return { ok: false, reason: "already_provisioning", nextStatus: null };
    }
    if (request.status === "PAID") {
      return {
        ok: false,
        reason: "provisioner_not_configured",
        nextStatus: null,
      };
    }
    if (
      request.status === "CANCELLED" ||
      request.status === "FAILED" ||
      request.status === "EXPIRED"
    ) {
      return { ok: false, reason: "terminal_status", nextStatus: null };
    }
    return { ok: false, reason: "order_not_paid", nextStatus: null };
  },
};
