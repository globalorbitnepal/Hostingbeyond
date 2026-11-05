import { randomBytes } from "crypto";

import { Prisma } from "@prisma/client";

import type {
  CommerceProposal,
  CommerceProposalKind,
  CommerceProposalStatus,
  DomainRegisterPayload,
  HostingCheckoutPayload,
  NameserverPayload,
} from "@/lib/beyond-master/commerce/types";
import type { CommerceStore } from "@/lib/beyond-master/commerce/store";
import { prisma } from "@/lib/prisma";

type Row = {
  publicId: string;
  customerUserId: string;
  idempotencyKey: string;
  kind: string;
  payload: unknown;
  status: string;
  expiresAt: Date;
  claimToken: string | null;
  resultMessage: string | null;
  verified: boolean | null;
  executionErrorCode: string | null;
};

export function prismaCommerceStore(): CommerceStore {
  return {
    async findByPublicId(publicId) {
      const row = await prisma.beyondMasterCommerceProposal.findUnique({
        where: { publicId },
      });
      return row ? fromRow(row) : null;
    },
    async insert(proposal) {
      try {
        const created = await prisma.beyondMasterCommerceProposal.create({
          data: toData(proposal),
        });
        return fromRow(created);
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        const existing = await prisma.beyondMasterCommerceProposal.findUnique({
          where: { idempotencyKey: proposal.idempotencyKey },
        });
        if (existing && existing.customerUserId === proposal.customerUserId) {
          return fromRow(existing);
        }
        throw error;
      }
    },
    async claimPending(publicId, userId, now) {
      const claimToken = randomBytes(16).toString("hex");
      const claimed = await prisma.beyondMasterCommerceProposal.updateMany({
        where: {
          publicId,
          customerUserId: userId,
          status: "pending",
          expiresAt: { gt: now },
        },
        data: { status: "executing", claimToken },
      });
      const current = await prisma.beyondMasterCommerceProposal.findUnique({
        where: { publicId },
      });
      const proposal =
        current && current.customerUserId === userId ? fromRow(current) : null;
      if (claimed.count === 1 && proposal?.claimToken === claimToken) {
        return { ok: true as const, proposal };
      }
      return { ok: false as const, proposal };
    },
    async finish(proposal) {
      if (!proposal.claimToken) return;
      await prisma.beyondMasterCommerceProposal.updateMany({
        where: {
          publicId: proposal.publicId,
          status: "executing",
          claimToken: proposal.claimToken,
        },
        data: {
          status: proposal.status,
          resultMessage: proposal.resultMessage,
          verified: proposal.verified,
          executionErrorCode: proposal.executionErrorCode ?? null,
          claimToken: null,
        },
      });
    },
    async cancelPending(publicId, userId) {
      await prisma.beyondMasterCommerceProposal.updateMany({
        where: { publicId, customerUserId: userId, status: "pending" },
        data: { status: "cancelled" },
      });
      const current = await prisma.beyondMasterCommerceProposal.findUnique({
        where: { publicId },
      });
      return current && current.customerUserId === userId
        ? fromRow(current)
        : null;
    },
    async expirePending(publicId, userId, now) {
      await prisma.beyondMasterCommerceProposal.updateMany({
        where: {
          publicId,
          customerUserId: userId,
          status: "pending",
          expiresAt: { lte: now },
        },
        data: { status: "expired" },
      });
      const current = await prisma.beyondMasterCommerceProposal.findUnique({
        where: { publicId },
      });
      return current && current.customerUserId === userId
        ? fromRow(current)
        : null;
    },
  };
}

function toData(proposal: CommerceProposal) {
  return {
    publicId: proposal.publicId,
    customerUserId: proposal.customerUserId,
    idempotencyKey: proposal.idempotencyKey,
    kind: proposal.kind,
    payload: proposal.payload as Prisma.InputJsonValue,
    status: proposal.status,
    expiresAt: proposal.expiresAt,
    claimToken: proposal.claimToken,
    resultMessage: proposal.resultMessage,
    verified: proposal.verified,
    executionErrorCode: proposal.executionErrorCode ?? null,
  };
}

function fromRow(row: Row): CommerceProposal {
  return {
    publicId: row.publicId,
    customerUserId: row.customerUserId,
    kind: row.kind as CommerceProposalKind,
    idempotencyKey: row.idempotencyKey,
    status: row.status as CommerceProposalStatus,
    expiresAt: row.expiresAt,
    claimToken: row.claimToken,
    payload: parsePayload(row.kind, row.payload),
    resultMessage: row.resultMessage,
    verified: row.verified,
    executionErrorCode: row.executionErrorCode,
  };
}

function parsePayload(
  kind: string,
  payload: unknown,
): CommerceProposal["payload"] {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid commerce proposal payload.");
  }
  if (kind === "domain_register") {
    return payload as DomainRegisterPayload;
  }
  if (kind === "nameserver_update") {
    return payload as NameserverPayload;
  }
  return payload as HostingCheckoutPayload;
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
