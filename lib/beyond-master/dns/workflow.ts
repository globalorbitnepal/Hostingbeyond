import { createHash, randomBytes } from "crypto";

import type { ProviderDnsRecord } from "@/lib/domains/providers/provider";
import {
  validateStrictDnsChange,
  type DnsProposalAction,
  type StrictDnsChange,
} from "@/lib/beyond-master/dns/validate";

export type DnsProposalStatus =
  "pending" | "executing" | "cancelled" | "expired" | "executed" | "failed";

export type DnsSnapshot = {
  type: string;
  host: string;
  value: string;
  ttl: number;
  distance: number;
};

export type DnsProposal = {
  publicId: string;
  customerUserId: string;
  domain: string;
  action: DnsProposalAction;
  change: StrictDnsChange;
  recordId: string | null;
  snapshot: DnsSnapshot | null;
  status: DnsProposalStatus;
  expiresAt: string;
  claimToken: string | null;
  providerStatus: string | null;
  verified: boolean | null;
};

export type DnsProposalView = {
  publicId: string;
  domain: string;
  action: DnsProposalAction;
  type: string;
  host: string;
  current: DnsSnapshot | null;
  value: string;
  ttl: number;
  priority: number | null;
  effect: string;
  status: DnsProposalStatus;
  expiresAt: string;
  providerStatus: string | null;
  verified: boolean | null;
  propagation: string;
};

export type DnsPorts = {
  own(
    userId: string,
    domain: string,
  ): Promise<
    { ok: true; domain: string } | { ok: false; status: number; error: string }
  >;
  list(
    userId: string,
    domain: string,
  ): Promise<
    | { ok: true; records: ProviderDnsRecord[] }
    | { ok: false; status: number; error: string }
  >;
  write(input: {
    userId: string;
    domain: string;
    action: DnsProposalAction;
    change: StrictDnsChange;
    recordId: string | null;
  }): Promise<{ ok: true } | { ok: false; error: string; uncertain?: boolean }>;
  audit(entry: Record<string, unknown>): Promise<void>;
  now(): Date;
};

const TTL_MS = 15 * 60 * 1000;

export type DnsClaim =
  | { ok: true; proposal: DnsProposal }
  | { ok: false; proposal: DnsProposal | null };

export type DnsStore = {
  findByPublicId(publicId: string): Promise<DnsProposal | null>;
  insert(row: DnsProposal): Promise<DnsProposal>;
  claimPending(publicId: string, userId: string, now: Date): Promise<DnsClaim>;
  finish(proposal: DnsProposal): Promise<void>;
  cancelPending(publicId: string, userId: string): Promise<DnsProposal | null>;
  expirePending(
    publicId: string,
    userId: string,
    now: Date,
  ): Promise<DnsProposal | null>;
};

export function createMemoryDnsStore(shared?: DnsProposal[]): DnsStore & {
  rows: DnsProposal[];
  failNextClaim(): void;
  interruptNextClaim(): void;
} {
  const rows = shared ?? [];
  let failClaim = false;
  let interruptAfterClaim = false;
  return {
    rows,
    failNextClaim() {
      failClaim = true;
    },
    interruptNextClaim() {
      interruptAfterClaim = true;
    },
    async findByPublicId(publicId) {
      const row = rows.find((item) => item.publicId === publicId);
      return row ? cloneProposal(row) : null;
    },
    async insert(row) {
      const existing = rows.find(
        (item) => idempotency(item) === idempotency(row),
      );
      if (existing) return cloneProposal(existing);
      rows.push(cloneProposal(row));
      return cloneProposal(row);
    },
    async claimPending(publicId, userId, now) {
      if (failClaim) {
        failClaim = false;
        throw new Error("database unavailable");
      }
      const row = rows.find((item) => item.publicId === publicId);
      if (
        !row ||
        row.customerUserId !== userId ||
        row.status !== "pending" ||
        new Date(row.expiresAt).getTime() <= now.getTime()
      ) {
        return { ok: false, proposal: row ? cloneProposal(row) : null };
      }
      row.status = "executing";
      row.claimToken = randomBytes(8).toString("hex");
      if (interruptAfterClaim) {
        interruptAfterClaim = false;
        throw new Error("process interrupted");
      }
      return { ok: true, proposal: cloneProposal(row) };
    },
    async finish(proposal) {
      const row = rows.find(
        (item) =>
          item.publicId === proposal.publicId &&
          item.status === "executing" &&
          item.claimToken === proposal.claimToken,
      );
      if (!row) return;
      row.status = proposal.status;
      row.providerStatus = proposal.providerStatus;
      row.verified = proposal.verified;
    },
    async cancelPending(publicId, userId) {
      const row = rows.find(
        (item) => item.publicId === publicId && item.customerUserId === userId,
      );
      if (!row) return null;
      if (row.status === "pending") row.status = "cancelled";
      return cloneProposal(row);
    },
    async expirePending(publicId, userId, now) {
      const row = rows.find(
        (item) => item.publicId === publicId && item.customerUserId === userId,
      );
      if (!row) return null;
      if (
        row.status === "pending" &&
        new Date(row.expiresAt).getTime() <= now.getTime()
      ) {
        row.status = "expired";
      }
      return cloneProposal(row);
    },
  };
}

export async function proposeDnsChange(input: {
  userId: string;
  domain: string;
  action: DnsProposalAction;
  type: string;
  host: string;
  value: string;
  ttl?: number | null;
  priority?: number | null;
  recordId?: string | null;
  ports: DnsPorts;
  store: DnsStore;
}): Promise<
  | { ok: true; proposal: DnsProposalView }
  | { ok: false; status: number; error: string }
> {
  const owned = await input.ports.own(input.userId, input.domain);
  if (!owned.ok) return owned;
  const listed = await input.ports.list(input.userId, owned.domain);
  if (!listed.ok) return listed;
  const validated = validateStrictDnsChange(
    {
      action: input.action,
      type: input.type,
      host: input.host,
      value: input.value,
      ttl: input.ttl,
      priority: input.priority,
    },
    owned.domain,
  );
  if (!validated.ok) return { ok: false, status: 400, error: validated.error };
  let snapshot: DnsSnapshot | null = null;
  let recordId: string | null = null;
  if (input.action !== "add") {
    const matches = listed.records.filter((record) => {
      if (input.recordId) return record.recordId === input.recordId;
      return (
        record.type.toUpperCase() === validated.change.type &&
        record.host.toLowerCase() === validated.change.host
      );
    });
    if (matches.length !== 1) {
      return {
        ok: false,
        status: 409,
        error:
          matches.length === 0
            ? "No matching DNS record was found to change."
            : "More than one record matches. Name the exact host and type.",
      };
    }
    const current = matches[0]!;
    snapshot = snapshotOf(current);
    recordId = current.recordId;
    if (input.action === "delete") {
      validated.change.value = current.value;
      validated.change.ttl = current.ttl;
      validated.change.priority =
        current.type === "MX" ? current.distance : null;
    }
  }
  const now = input.ports.now();
  const proposal: DnsProposal = {
    publicId: `dns_${randomBytes(18).toString("base64url")}`,
    customerUserId: input.userId,
    domain: owned.domain,
    action: input.action,
    change: validated.change,
    recordId,
    snapshot,
    status: "pending",
    expiresAt: new Date(now.getTime() + TTL_MS).toISOString(),
    claimToken: null,
    providerStatus: null,
    verified: null,
  };
  const stored = await input.store.insert(proposal);
  return { ok: true, proposal: view(stored) };
}

export async function cancelDnsProposal(input: {
  userId: string;
  publicId: string;
  store: DnsStore;
}): Promise<
  | { ok: true; proposal: DnsProposalView }
  | { ok: false; status: number; error: string }
> {
  const row = await input.store.cancelPending(input.publicId, input.userId);
  if (!row)
    return {
      ok: false,
      status: 404,
      error: "That DNS proposal was not found.",
    };
  if (row.status === "executed" || row.status === "executing") {
    return {
      ok: false,
      status: 409,
      error: "That DNS change was already executed.",
    };
  }
  if (row.status !== "cancelled") {
    return {
      ok: false,
      status: 409,
      error: "That DNS proposal can no longer be cancelled.",
    };
  }
  return { ok: true, proposal: view(row) };
}

export async function confirmDnsProposal(input: {
  userId: string;
  publicId: string;
  ports: DnsPorts;
  store: DnsStore;
}): Promise<
  | { ok: true; proposal: DnsProposalView }
  | { ok: false; status: number; error: string }
> {
  const row = await input.store.findByPublicId(input.publicId);
  if (!row || row.customerUserId !== input.userId) {
    return {
      ok: false,
      status: 404,
      error: "That DNS proposal was not found.",
    };
  }
  if (row.status === "cancelled") {
    return {
      ok: false,
      status: 409,
      error: "That DNS proposal was cancelled.",
    };
  }
  if (row.status === "executed" || row.status === "failed") {
    return { ok: true, proposal: view(row) };
  }
  if (row.status === "executing") {
    return {
      ok: false,
      status: 409,
      error:
        "That DNS change is already executing. The result is uncertain, so the write was not repeated.",
    };
  }
  if (new Date(row.expiresAt).getTime() <= input.ports.now().getTime()) {
    const expired = await input.store.expirePending(
      input.publicId,
      input.userId,
      input.ports.now(),
    );
    return {
      ok: false,
      status: 409,
      error:
        expired?.status === "expired"
          ? "That DNS proposal expired. Review a new one."
          : "That DNS proposal can no longer be confirmed.",
    };
  }
  const owned = await input.ports.own(input.userId, row.domain);
  if (!owned.ok) return owned;
  const again = validateStrictDnsChange(row.change, owned.domain);
  if (!again.ok) return { ok: false, status: 400, error: again.error };
  const listed = await input.ports.list(input.userId, owned.domain);
  if (!listed.ok) return listed;
  if (row.action !== "add") {
    const current = listed.records.find(
      (record) => record.recordId === row.recordId,
    );
    if (!current || !sameSnapshot(snapshotOf(current), row.snapshot)) {
      return {
        ok: false,
        status: 409,
        error: "The DNS record changed after review. Create a new proposal.",
      };
    }
  }
  let claim: DnsClaim;
  try {
    claim = await input.store.claimPending(
      input.publicId,
      input.userId,
      input.ports.now(),
    );
  } catch {
    return {
      ok: false,
      status: 503,
      error: "The DNS proposal could not be claimed. No change was sent.",
    };
  }
  if (!claim.ok) return storedOrBusy(claim.proposal);
  const claimed = claim.proposal;
  let wrote: { ok: true } | { ok: false; error: string; uncertain?: boolean };
  try {
    wrote = await input.ports.write({
      userId: input.userId,
      domain: owned.domain,
      action: claimed.action,
      change: claimed.change,
      recordId: claimed.recordId,
    });
  } catch {
    wrote = {
      ok: false,
      uncertain: true,
      error: "The DNS provider did not return a definite result.",
    };
  }
  if (!wrote.ok) {
    claimed.status = "failed";
    claimed.providerStatus = wrote.uncertain ? "uncertain" : "rejected";
    claimed.verified = wrote.uncertain ? null : false;
    await input.store.finish(claimed);
    await input.ports.audit(auditBody(claimed, input.userId));
    return {
      ok: false,
      status: 502,
      error: wrote.uncertain
        ? "The DNS provider did not return a definite result. The write was not retried."
        : wrote.error,
    };
  }
  claimed.providerStatus = "accepted";
  claimed.status = "executed";
  const verify = await input.ports.list(input.userId, owned.domain);
  if (!verify.ok) claimed.verified = null;
  else claimed.verified = matchesRequest(claimed, verify.records);
  await input.store.finish(claimed);
  await input.ports.audit(auditBody(claimed, input.userId));
  return { ok: true, proposal: view(claimed) };
}

function storedOrBusy(
  proposal: DnsProposal | null,
):
  | { ok: true; proposal: DnsProposalView }
  | { ok: false; status: number; error: string } {
  if (!proposal)
    return {
      ok: false,
      status: 404,
      error: "That DNS proposal was not found.",
    };
  if (proposal.status === "executed" || proposal.status === "failed") {
    return { ok: true, proposal: view(proposal) };
  }
  if (proposal.status === "executing") {
    return {
      ok: false,
      status: 409,
      error:
        "That DNS change is already executing. The result is uncertain, so the write was not repeated.",
    };
  }
  if (proposal.status === "cancelled") {
    return {
      ok: false,
      status: 409,
      error: "That DNS proposal was cancelled.",
    };
  }
  if (proposal.status === "expired") {
    return {
      ok: false,
      status: 409,
      error: "That DNS proposal expired. Review a new one.",
    };
  }
  return {
    ok: false,
    status: 409,
    error: "That DNS proposal can no longer be confirmed.",
  };
}

export function view(row: DnsProposal): DnsProposalView {
  const destructive = row.action === "delete";
  return {
    publicId: row.publicId,
    domain: row.domain,
    action: row.action,
    type: row.change.type,
    host: row.change.host,
    current: row.snapshot,
    value: row.change.value,
    ttl: row.change.ttl,
    priority: row.change.priority,
    effect: destructive
      ? "This deletes the live record shown above. This assistant cannot roll the change back."
      : `This ${row.action}s the ${row.change.type} record. DNS propagation is not immediate.`,
    status: row.status,
    expiresAt: row.expiresAt,
    providerStatus: row.providerStatus,
    verified: row.verified,
    propagation:
      "DNS propagation may take time. This does not mean the change is visible everywhere yet.",
  };
}

function cloneProposal(row: DnsProposal): DnsProposal {
  return {
    ...row,
    change: { ...row.change },
    snapshot: row.snapshot ? { ...row.snapshot } : null,
  };
}

function snapshotOf(record: ProviderDnsRecord): DnsSnapshot {
  return {
    type: record.type.toUpperCase(),
    host: record.host.toLowerCase(),
    value: record.value,
    ttl: record.ttl,
    distance: record.distance,
  };
}

function sameSnapshot(left: DnsSnapshot, right: DnsSnapshot | null) {
  if (!right) return false;
  return (
    left.type === right.type &&
    left.host === right.host &&
    left.value === right.value &&
    left.ttl === right.ttl &&
    left.distance === right.distance
  );
}

function matchesRequest(row: DnsProposal, records: ProviderDnsRecord[]) {
  if (row.action === "delete") {
    return !records.some((record) => record.recordId === row.recordId);
  }
  return records.some(
    (record) =>
      record.type.toUpperCase() === row.change.type &&
      record.host.toLowerCase() === row.change.host &&
      record.value === row.change.value,
  );
}

function idempotency(row: DnsProposal) {
  return createHash("sha256")
    .update(
      [
        row.customerUserId,
        row.domain,
        row.action,
        row.change.type,
        row.change.host,
        row.change.value,
        String(row.change.ttl),
        String(row.change.priority ?? ""),
        row.recordId ?? "",
      ].join("\n"),
    )
    .digest("hex");
}

function auditBody(row: DnsProposal, userId: string) {
  return {
    customerUserId: userId,
    domain: row.domain,
    proposalId: row.publicId,
    action: row.action,
    recordType: row.change.type,
    previous: row.snapshot,
    next: row.action === "delete" ? null : row.change,
    providerStatus: row.providerStatus,
    verified: row.verified,
    at: new Date().toISOString(),
  };
}
