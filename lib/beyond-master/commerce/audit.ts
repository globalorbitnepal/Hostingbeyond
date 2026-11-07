import type { Prisma } from "@prisma/client";

import type { CommerceProposalKind } from "@/lib/beyond-master/commerce/types";
import { prisma } from "@/lib/prisma";

export type CommerceAuditEvent =
  | "PROPOSAL_CREATED"
  | "CUSTOMER_CONFIRM_ATTEMPT"
  | "CANCELLED"
  | "EXPIRED"
  | "EXECUTION_SUCCESS"
  | "EXECUTION_FAILED"
  | "DUPLICATE_CONFIRM";

export type CommerceAuditEntry = {
  event: CommerceAuditEvent;
  customerUserId: string;
  proposalId: string;
  kind: CommerceProposalKind | string;
  status: string;
  errorCode?: string | null;
};

let auditOverride: ((entry: CommerceAuditEntry) => Promise<void>) | null = null;

export function setCommerceAuditForTests(
  handler: ((entry: CommerceAuditEntry) => Promise<void>) | null,
) {
  if (process.env.NODE_ENV === "production") return;
  auditOverride = handler;
}

export async function auditCommerceEvent(entry: CommerceAuditEntry) {
  if (auditOverride) {
    await auditOverride(entry);
    return;
  }
  const details: Record<string, unknown> = {
    event: entry.event,
    customerUserId: entry.customerUserId,
    proposalId: entry.proposalId,
    kind: entry.kind,
    status: entry.status,
    timestamp: new Date().toISOString(),
  };
  if (entry.errorCode) details.errorCode = entry.errorCode;
  await prisma.domainAuditLog.create({
    data: {
      action: "BEYOND_MASTER_COMMERCE",
      resource: "BeyondMasterCommerceProposal",
      resourceId: entry.proposalId,
      details: details as Prisma.InputJsonValue,
    },
  });
}
