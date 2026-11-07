import { createHash, randomBytes } from "crypto";

import type {
  CommerceProposal,
  CommerceProposalStatus,
} from "@/lib/beyond-master/commerce/types";
import { prismaCommerceStore } from "@/lib/beyond-master/commerce/prisma-store";
import { beyondMasterCommerceRuntime } from "@/lib/beyond-master/commerce/runtime";

const TTL_MS = 15 * 60 * 1000;

export function commerceProposalPublicId(): string {
  return randomBytes(9).toString("hex");
}

export function commerceIdempotencyKey(
  customerUserId: string,
  kind: string,
  fingerprint: string,
): string {
  const hash = createHash("sha256")
    .update(`${customerUserId}:${kind}:${fingerprint}`)
    .digest("hex")
    .slice(0, 40);
  return `bm-commerce-${hash}`;
}

export type CommerceStore = {
  findByPublicId(publicId: string): Promise<CommerceProposal | null>;
  insert(row: CommerceProposal): Promise<CommerceProposal>;
  claimPending(
    publicId: string,
    userId: string,
    now: Date,
  ): Promise<
    | { ok: true; proposal: CommerceProposal }
    | { ok: false; proposal: CommerceProposal | null }
  >;
  finish(proposal: CommerceProposal): Promise<void>;
  cancelPending(
    publicId: string,
    userId: string,
  ): Promise<CommerceProposal | null>;
  expirePending(
    publicId: string,
    userId: string,
    now: Date,
  ): Promise<CommerceProposal | null>;
};

export function createMemoryCommerceStore(
  shared?: CommerceProposal[],
): CommerceStore & { rows: CommerceProposal[] } {
  const backing = shared ?? [];
  const rows = new Map<string, CommerceProposal>();
  const byIdempotency = new Map<string, string>();
  for (const row of backing) {
    rows.set(row.publicId, row);
    byIdempotency.set(row.idempotencyKey, row.publicId);
  }
  const syncBacking = (proposal: CommerceProposal) => {
    const index = backing.findIndex(
      (row) => row.publicId === proposal.publicId,
    );
    if (index >= 0) backing[index] = proposal;
    else backing.push(proposal);
  };
  return {
    rows: backing,
    async findByPublicId(publicId) {
      return rows.get(publicId) ?? null;
    },
    async insert(proposal) {
      const existingKey = byIdempotency.get(proposal.idempotencyKey);
      if (existingKey) {
        const existing = rows.get(existingKey);
        if (existing && existing.customerUserId === proposal.customerUserId) {
          return existing;
        }
      }
      rows.set(proposal.publicId, proposal);
      byIdempotency.set(proposal.idempotencyKey, proposal.publicId);
      syncBacking(proposal);
      return proposal;
    },
    async claimPending(publicId, userId, now) {
      const claimToken = randomBytes(16).toString("hex");
      const current = rows.get(publicId) ?? null;
      if (
        !current ||
        current.customerUserId !== userId ||
        current.status !== "pending" ||
        current.expiresAt <= now
      ) {
        return { ok: false, proposal: current };
      }
      const next = { ...current, status: "executing" as const, claimToken };
      rows.set(publicId, next);
      syncBacking(next);
      return { ok: true, proposal: next };
    },
    async finish(proposal) {
      rows.set(proposal.publicId, proposal);
      syncBacking(proposal);
    },
    async cancelPending(publicId, userId) {
      const current = rows.get(publicId) ?? null;
      if (!current || current.customerUserId !== userId) return null;
      if (current.status !== "pending") return current;
      const next = { ...current, status: "cancelled" as const };
      rows.set(publicId, next);
      syncBacking(next);
      return next;
    },
    async expirePending(publicId, userId, now) {
      const current = rows.get(publicId) ?? null;
      if (
        !current ||
        current.customerUserId !== userId ||
        current.status !== "pending" ||
        current.expiresAt > now
      ) {
        return current;
      }
      const next = { ...current, status: "expired" as const };
      rows.set(publicId, next);
      syncBacking(next);
      return next;
    },
  };
}

let storeOverride: CommerceStore | null = null;

export function setBeyondMasterCommerceStoreForTests(
  store: CommerceStore | null,
) {
  if (process.env.NODE_ENV === "production") return;
  storeOverride = store;
}

export function beyondMasterCommerceStore(): CommerceStore {
  if (process.env.NODE_ENV !== "production" && storeOverride) {
    return storeOverride;
  }
  return beyondMasterCommerceRuntime().store;
}

export function commerceExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + TTL_MS);
}

export function markCommerceStatus(
  proposal: CommerceProposal,
  status: CommerceProposalStatus,
  patch?: Partial<
    Pick<CommerceProposal, "resultMessage" | "verified" | "executionErrorCode">
  >,
): CommerceProposal {
  return {
    ...proposal,
    status,
    claimToken: null,
    resultMessage: patch?.resultMessage ?? proposal.resultMessage,
    verified: patch?.verified ?? proposal.verified,
    executionErrorCode:
      patch?.executionErrorCode ?? proposal.executionErrorCode,
  };
}

export { prismaCommerceStore };
