import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import type { DnsProposal, DnsStore } from "@/lib/beyond-master/dns/workflow";
import type { DnsSnapshot } from "@/lib/beyond-master/dns/workflow";
import type { StrictDnsChange } from "@/lib/beyond-master/dns/validate";

type Row = {
  publicId: string;
  customerUserId: string;
  domain: string;
  action: string;
  recordType: string;
  host: string;
  value: string;
  ttl: number;
  priority: number | null;
  recordId: string | null;
  snapshot: unknown;
  status: string;
  expiresAt: Date;
  claimToken: string | null;
  providerStatus: string | null;
  verified: boolean | null;
};

export function prismaDnsStore(): DnsStore {
  return {
    async findByPublicId(publicId) {
      const row = await prisma.beyondMasterDnsProposal.findUnique({
        where: { publicId },
      });
      return row ? fromRow(row) : null;
    },
    async insert(proposal) {
      const created = await prisma.beyondMasterDnsProposal.create({
        data: toData(proposal),
      });
      return fromRow(created);
    },
    async claimPending(publicId, userId, now) {
      const claimToken = randomBytes(16).toString("hex");
      const claimed = await prisma.beyondMasterDnsProposal.updateMany({
        where: {
          publicId,
          customerUserId: userId,
          status: "pending",
          expiresAt: { gt: now },
        },
        data: { status: "executing", claimToken },
      });
      const current = await prisma.beyondMasterDnsProposal.findUnique({
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
      await prisma.beyondMasterDnsProposal.updateMany({
        where: {
          publicId: proposal.publicId,
          status: "executing",
          claimToken: proposal.claimToken,
        },
        data: {
          status: proposal.status,
          providerStatus: proposal.providerStatus,
          verified: proposal.verified,
          claimToken: null,
        },
      });
    },
    async cancelPending(publicId, userId) {
      await prisma.beyondMasterDnsProposal.updateMany({
        where: { publicId, customerUserId: userId, status: "pending" },
        data: { status: "cancelled" },
      });
      const current = await prisma.beyondMasterDnsProposal.findUnique({
        where: { publicId },
      });
      return current && current.customerUserId === userId
        ? fromRow(current)
        : null;
    },
    async expirePending(publicId, userId, now) {
      await prisma.beyondMasterDnsProposal.updateMany({
        where: {
          publicId,
          customerUserId: userId,
          status: "pending",
          expiresAt: { lte: now },
        },
        data: { status: "expired" },
      });
      const current = await prisma.beyondMasterDnsProposal.findUnique({
        where: { publicId },
      });
      return current && current.customerUserId === userId
        ? fromRow(current)
        : null;
    },
  };
}

function toData(proposal: DnsProposal) {
  return {
    publicId: proposal.publicId,
    customerUserId: proposal.customerUserId,
    idempotencyKey: proposal.publicId,
    domain: proposal.domain,
    action: proposal.action,
    recordType: proposal.change.type,
    host: proposal.change.host,
    value: proposal.change.value,
    ttl: proposal.change.ttl,
    priority: proposal.change.priority,
    recordId: proposal.recordId,
    snapshot: proposal.snapshot ?? undefined,
    status: proposal.status,
    expiresAt: new Date(proposal.expiresAt),
    providerStatus: proposal.providerStatus,
    verified: proposal.verified,
  };
}

function fromRow(row: Row): DnsProposal {
  const snapshot = isSnapshot(row.snapshot) ? row.snapshot : null;
  const change: StrictDnsChange = {
    action: row.action as StrictDnsChange["action"],
    type: row.recordType,
    host: row.host,
    value: row.value,
    ttl: row.ttl,
    priority: row.priority,
  };
  return {
    publicId: row.publicId,
    customerUserId: row.customerUserId,
    domain: row.domain,
    action: change.action,
    change,
    recordId: row.recordId,
    snapshot,
    status: row.status as DnsProposal["status"],
    expiresAt: row.expiresAt.toISOString(),
    claimToken: row.claimToken,
    providerStatus: row.providerStatus,
    verified: row.verified,
  };
}

function isSnapshot(value: unknown): value is DnsSnapshot {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.type === "string" &&
    typeof row.host === "string" &&
    typeof row.value === "string" &&
    typeof row.ttl === "number" &&
    typeof row.distance === "number"
  );
}
