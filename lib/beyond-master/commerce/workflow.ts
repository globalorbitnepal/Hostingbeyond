import type { CommerceProposalKind } from "@/lib/beyond-master/commerce/types";
import { auditCommerceEvent } from "@/lib/beyond-master/commerce/audit";
import {
  beyondMasterCommerceStore,
  markCommerceStatus,
} from "@/lib/beyond-master/commerce/store";
import type { CommerceProposal } from "@/lib/beyond-master/commerce/types";
import { commerceProposalView } from "@/lib/beyond-master/commerce/view";

export type CommerceConfirmStart =
  | {
      ok: true;
      mode: "execute";
      proposal: CommerceProposal;
    }
  | {
      ok: true;
      mode: "replay";
      view: ReturnType<typeof commerceProposalView>;
    }
  | { ok: false; error: string; status: number };

export async function beginCommerceConfirm(input: {
  customerUserId: string;
  publicId: string;
  expectedKind: CommerceProposalKind;
  now?: Date;
}): Promise<CommerceConfirmStart> {
  const now = input.now ?? new Date();
  const store = beyondMasterCommerceStore();
  const row = await store.findByPublicId(input.publicId);
  if (!row || row.customerUserId !== input.customerUserId) {
    return { ok: false, error: "Proposal not found.", status: 404 };
  }
  if (row.kind !== input.expectedKind) {
    return { ok: false, error: "Proposal type mismatch.", status: 409 };
  }
  if (row.status === "executed" || row.status === "failed") {
    await auditCommerceEvent({
      event: "DUPLICATE_CONFIRM",
      customerUserId: input.customerUserId,
      proposalId: row.publicId,
      kind: row.kind,
      status: row.status,
      errorCode: "already_finalized",
    });
    return { ok: true, mode: "replay", view: commerceProposalView(row) };
  }
  if (row.status === "cancelled") {
    return {
      ok: false,
      error: "This proposal was cancelled.",
      status: 409,
    };
  }
  if (row.status === "executing") {
    await auditCommerceEvent({
      event: "DUPLICATE_CONFIRM",
      customerUserId: input.customerUserId,
      proposalId: row.publicId,
      kind: row.kind,
      status: row.status,
      errorCode: "concurrent_confirm",
    });
    return {
      ok: false,
      error: "This action is already being confirmed.",
      status: 409,
    };
  }
  if (row.expiresAt <= now) {
    await store.expirePending(input.publicId, input.customerUserId, now);
    await auditCommerceEvent({
      event: "EXPIRED",
      customerUserId: input.customerUserId,
      proposalId: row.publicId,
      kind: row.kind,
      status: "expired",
      errorCode: "proposal_expired",
    });
    return {
      ok: false,
      error: "This proposal expired. Start a new one.",
      status: 409,
    };
  }
  if (row.status !== "pending") {
    return {
      ok: false,
      error: "This proposal can no longer be confirmed.",
      status: 409,
    };
  }
  await auditCommerceEvent({
    event: "CUSTOMER_CONFIRM_ATTEMPT",
    customerUserId: input.customerUserId,
    proposalId: row.publicId,
    kind: row.kind,
    status: "pending",
  });
  const claim = await store.claimPending(
    input.publicId,
    input.customerUserId,
    now,
  );
  if (!claim.ok || !claim.proposal) {
    await auditCommerceEvent({
      event: "DUPLICATE_CONFIRM",
      customerUserId: input.customerUserId,
      proposalId: row.publicId,
      kind: row.kind,
      status: claim.proposal?.status ?? row.status,
      errorCode: "claim_rejected",
    });
    return {
      ok: false,
      error: "This proposal can no longer be confirmed.",
      status: 409,
    };
  }
  return { ok: true, mode: "execute", proposal: claim.proposal };
}

export async function finishCommerceExecution(input: {
  proposal: CommerceProposal;
  success: boolean;
  resultMessage: string;
  verified: boolean | null;
  errorCode?: string | null;
}) {
  const store = beyondMasterCommerceStore();
  const finished = markCommerceStatus(
    input.proposal,
    input.success ? "executed" : "failed",
    {
      resultMessage: input.resultMessage,
      verified: input.verified,
      executionErrorCode: input.errorCode ?? null,
    },
  );
  await store.finish(finished);
  await auditCommerceEvent({
    event: input.success ? "EXECUTION_SUCCESS" : "EXECUTION_FAILED",
    customerUserId: finished.customerUserId,
    proposalId: finished.publicId,
    kind: finished.kind,
    status: finished.status,
    errorCode: input.errorCode ?? null,
  });
  return finished;
}
