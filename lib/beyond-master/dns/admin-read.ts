import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const DNS_ADMIN_MIGRATION_MESSAGE =
  "DNS management is unavailable until the database migration is applied.";

export const DNS_UNCERTAIN_EXPLANATION =
  "The DNS provider operation may have been accepted, but the final result could not be independently verified. Check the current DNS records before attempting another change.";

export const DNS_PROPOSAL_STATUSES = [
  "pending",
  "executing",
  "cancelled",
  "expired",
  "executed",
  "failed",
] as const;

export const DNS_RECORD_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SRV",
] as const;

export const DNS_VERIFICATION_FILTERS = [
  "verified",
  "unverified",
  "mismatch",
] as const;

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000;

export type DnsProposalStatus = (typeof DNS_PROPOSAL_STATUSES)[number];
export type DnsVerificationLabel =
  "verified" | "unverified" | "mismatch" | "not_recorded";

export type DnsAdminCounts = {
  total: number;
  pending: number;
  executed: number;
  rejected: number;
  expired: number;
  uncertain: number;
  verifiedSuccess: number;
  acceptedUnverified: number;
};

export type DnsAdminListItem = {
  publicId: string;
  domain: string;
  customerRef: string;
  recordType: string;
  host: string;
  action: string;
  status: string;
  providerStatus: string | null;
  verification: DnsVerificationLabel;
  createdAt: string;
  updatedAt: string;
};

export type DnsRecordSnapshot = {
  type: string;
  host: string;
  value: string;
  ttl: number | null;
  distance: number | null;
};

export type DnsAdminDetail = DnsAdminListItem & {
  value: string;
  ttl: number;
  priority: number | null;
  recordId: string | null;
  snapshot: DnsRecordSnapshot | null;
  expiresAt: string;
  uncertainExplanation: string | null;
};

export type DnsAuditItem = {
  id: string;
  action: "BEYOND_MASTER_DNS";
  domain: string | null;
  proposalId: string | null;
  recordAction: string | null;
  recordType: string | null;
  previous: DnsRecordSnapshot | null;
  next: {
    type: string;
    host: string;
    value: string;
    ttl: number | null;
    priority: number | null;
  } | null;
  providerStatus: string | null;
  verification: DnsVerificationLabel;
  createdAt: string;
};

export type DnsListQuery = {
  query: string;
  domain: string;
  status: DnsProposalStatus | null;
  recordType: (typeof DNS_RECORD_TYPES)[number] | null;
  customer: string;
  verification: (typeof DNS_VERIFICATION_FILTERS)[number] | null;
  from: Date | null;
  to: Date | null;
  page: number;
  pageSize: number;
};

export type DnsReadFailure = {
  ok: false;
  status: number;
  code: string;
  error: string;
};

export type DnsReadRepository = {
  list(
    input: DnsListQuery,
  ): Promise<
    | {
        ok: true;
        counts: DnsAdminCounts;
        proposals: DnsAdminListItem[];
        total: number;
        page: number;
        pageSize: number;
      }
    | DnsReadFailure
  >;
  get(publicId: string): Promise<DnsAdminDetail | null | DnsReadFailure>;
  audit(input: {
    publicId: string | null;
    domain: string;
    page: number;
    pageSize: number;
  }): Promise<
    | {
        ok: true;
        records: DnsAuditItem[];
        total: number;
        page: number;
        pageSize: number;
      }
    | DnsReadFailure
  >;
};

type StoredProposal = {
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
  expiresAt: string;
  claimToken: string | null;
  providerStatus: string | null;
  verified: boolean | null;
  createdAt: string;
  updatedAt: string;
};

type StoredAudit = {
  id: string;
  action: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
};

let repositoryOverride: DnsReadRepository | null = null;

export function setBeyondMasterDnsReadRepositoryForTests(
  repository: DnsReadRepository | null,
) {
  if (process.env.NODE_ENV === "production") return;
  repositoryOverride = repository;
}

export function getBeyondMasterDnsReadRepository(): DnsReadRepository {
  if (process.env.NODE_ENV !== "production" && repositoryOverride)
    return repositoryOverride;
  return prismaDnsReadRepository;
}

export function createMemoryDnsReadRepository(input?: {
  proposals?: StoredProposal[];
  audits?: StoredAudit[];
}): DnsReadRepository {
  const proposals = input?.proposals ?? [];
  const audits = input?.audits ?? [];
  return {
    async list(query) {
      const filtered = proposals.filter((row) => matchesProposal(row, query));
      const start = (query.page - 1) * query.pageSize;
      return {
        ok: true,
        counts: countsOf(proposals),
        proposals: filtered
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
          .slice(start, start + query.pageSize)
          .map(listItem),
        total: filtered.length,
        page: query.page,
        pageSize: query.pageSize,
      };
    },
    async get(publicId) {
      const row = proposals.find((item) => item.publicId === publicId);
      return row ? detailOf(row) : null;
    },
    async audit(query) {
      const filtered = audits.filter((row) => matchesAudit(row, query));
      const start = (query.page - 1) * query.pageSize;
      return {
        ok: true,
        records: filtered
          .slice(start, start + query.pageSize)
          .flatMap((row) => {
            const item = auditItem(row);
            return item ? [item] : [];
          }),
        total: filtered.length,
        page: query.page,
        pageSize: query.pageSize,
      };
    },
  };
}

export function parseDnsListQuery(
  url: URL,
): { ok: true; value: DnsListQuery } | { ok: false; error: string } {
  const statusRaw = url.searchParams.get("status");
  const status =
    statusRaw &&
    (DNS_PROPOSAL_STATUSES as readonly string[]).includes(statusRaw)
      ? (statusRaw as DnsProposalStatus)
      : null;
  if (statusRaw && !status)
    return { ok: false, error: "Choose a proposal status." };
  const typeRaw = (url.searchParams.get("type") ?? "").toUpperCase();
  const recordType =
    typeRaw && (DNS_RECORD_TYPES as readonly string[]).includes(typeRaw)
      ? (typeRaw as DnsListQuery["recordType"])
      : null;
  if (url.searchParams.get("type") && !recordType)
    return { ok: false, error: "Choose a record type." };
  const verificationRaw = url.searchParams.get("verification");
  const verification =
    verificationRaw &&
    (DNS_VERIFICATION_FILTERS as readonly string[]).includes(verificationRaw)
      ? (verificationRaw as DnsListQuery["verification"])
      : null;
  if (verificationRaw && !verification)
    return { ok: false, error: "Choose a verification result." };
  const customer = (url.searchParams.get("customer") ?? "").trim();
  if (
    customer &&
    (customer.includes("@") ||
      customer.length < 4 ||
      customer.length > 40 ||
      !/^[a-zA-Z0-9_-]+$/.test(customer))
  ) {
    return { ok: false, error: "Enter part of the customer id." };
  }
  const domain = (url.searchParams.get("domain") ?? "").trim().toLowerCase();
  if (domain && !/^[a-z0-9.-]{1,253}$/.test(domain))
    return { ok: false, error: "Enter a domain name." };
  const dates = dateRange(
    url.searchParams.get("from"),
    url.searchParams.get("to"),
  );
  if (!dates.ok) return dates;
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  if (!Number.isInteger(page) || page < 1 || page > 100)
    return { ok: false, error: "Choose a page." };
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50)
    return { ok: false, error: "Page size must be 50 or fewer." };
  return {
    ok: true,
    value: {
      query: (url.searchParams.get("q") ?? "").trim().slice(0, 120),
      domain,
      status,
      recordType,
      customer,
      verification,
      from: dates.from,
      to: dates.to,
      page,
      pageSize,
    },
  };
}

export async function adminListDns(adminId: string | null, request: Request) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseDnsListQuery(new URL(request.url));
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });
  const result = await getBeyondMasterDnsReadRepository().list(parsed.value);
  if (!result.ok) {
    if (result.code === "migration_pending")
      return Response.json({ available: false, message: result.error });
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({
    available: true,
    counts: result.counts,
    proposals: result.proposals,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
}

export async function adminGetDns(adminId: string | null, publicId: string) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^dns_[A-Za-z0-9_-]{4,80}$/.test(publicId)) {
    return Response.json(
      { error: "That DNS proposal was not found." },
      { status: 404 },
    );
  }
  const proposal = await getBeyondMasterDnsReadRepository().get(publicId);
  if (proposal && "ok" in proposal && proposal.ok === false) {
    return Response.json(
      proposal.code === "migration_pending"
        ? { available: false, message: proposal.error }
        : { error: proposal.error },
      { status: proposal.code === "migration_pending" ? 200 : proposal.status },
    );
  }
  if (!proposal)
    return Response.json(
      { error: "That DNS proposal was not found." },
      { status: 404 },
    );
  const audit = await getBeyondMasterDnsReadRepository().audit({
    publicId,
    domain: "",
    page: 1,
    pageSize: 20,
  });
  return Response.json({
    proposal,
    audit: audit.ok ? audit.records : [],
  });
}

export async function adminListDnsAudit(
  adminId: string | null,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const publicId = url.searchParams.get("proposal") ?? "";
  if (publicId && !/^dns_[A-Za-z0-9_-]{4,80}$/.test(publicId)) {
    return Response.json(
      { error: "That DNS proposal was not found." },
      { status: 404 },
    );
  }
  const domain = (url.searchParams.get("domain") ?? "").trim().toLowerCase();
  if (domain && !/^[a-z0-9.-]{1,253}$/.test(domain))
    return Response.json({ error: "Enter a domain name." }, { status: 400 });
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  if (!Number.isInteger(page) || page < 1 || page > 100)
    return Response.json({ error: "Choose a page." }, { status: 400 });
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    return Response.json(
      { error: "Page size must be 50 or fewer." },
      { status: 400 },
    );
  }
  const result = await getBeyondMasterDnsReadRepository().audit({
    publicId: publicId || null,
    domain,
    page,
    pageSize,
  });
  if (!result.ok) {
    if (result.code === "migration_pending")
      return Response.json({ available: false, message: result.error });
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({
    available: true,
    records: result.records,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
}

const prismaDnsReadRepository: DnsReadRepository = {
  async list(input) {
    try {
      const where = proposalWhere(input);
      const [
        totalAll,
        pending,
        executed,
        rejected,
        expired,
        uncertain,
        verifiedSuccess,
        acceptedUnverified,
        total,
        rows,
      ] = await Promise.all([
        prisma.beyondMasterDnsProposal.count(),
        prisma.beyondMasterDnsProposal.count({ where: { status: "pending" } }),
        prisma.beyondMasterDnsProposal.count({ where: { status: "executed" } }),
        prisma.beyondMasterDnsProposal.count({
          where: { providerStatus: "rejected" },
        }),
        prisma.beyondMasterDnsProposal.count({ where: { status: "expired" } }),
        prisma.beyondMasterDnsProposal.count({
          where: {
            OR: [{ providerStatus: "uncertain" }, { status: "executing" }],
          },
        }),
        prisma.beyondMasterDnsProposal.count({
          where: {
            status: "executed",
            providerStatus: "accepted",
            verified: true,
          },
        }),
        prisma.beyondMasterDnsProposal.count({
          where: {
            status: "executed",
            providerStatus: "accepted",
            verified: null,
          },
        }),
        prisma.beyondMasterDnsProposal.count({ where }),
        prisma.beyondMasterDnsProposal.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          select: {
            publicId: true,
            customerUserId: true,
            domain: true,
            action: true,
            recordType: true,
            host: true,
            status: true,
            providerStatus: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);
      return {
        ok: true as const,
        counts: {
          total: totalAll,
          pending,
          executed,
          rejected,
          expired,
          uncertain,
          verifiedSuccess,
          acceptedUnverified,
        },
        proposals: rows.map((row) =>
          listItem({
            ...row,
            value: "",
            ttl: 0,
            priority: null,
            recordId: null,
            snapshot: null,
            expiresAt: row.updatedAt.toISOString(),
            claimToken: null,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
          }),
        ),
        total,
        page: input.page,
        pageSize: input.pageSize,
      };
    } catch (error) {
      return asFailure(error);
    }
  },
  async get(publicId) {
    try {
      const row = await prisma.beyondMasterDnsProposal.findUnique({
        where: { publicId },
        select: {
          publicId: true,
          customerUserId: true,
          domain: true,
          action: true,
          recordType: true,
          host: true,
          value: true,
          ttl: true,
          priority: true,
          recordId: true,
          snapshot: true,
          status: true,
          expiresAt: true,
          providerStatus: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!row) return null;
      return detailOf({
        ...row,
        snapshot: row.snapshot,
        expiresAt: row.expiresAt.toISOString(),
        claimToken: null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      });
    } catch (error) {
      return asFailure(error);
    }
  },
  async audit(input) {
    try {
      const where: Prisma.DomainAuditLogWhereInput = {
        action: "BEYOND_MASTER_DNS",
        ...(input.publicId ? { resourceId: input.publicId } : {}),
        ...(input.domain
          ? { details: { path: ["domain"], string_contains: input.domain } }
          : {}),
      };
      const [total, rows] = await Promise.all([
        prisma.domainAuditLog.count({ where }),
        prisma.domainAuditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          select: {
            id: true,
            action: true,
            resourceId: true,
            details: true,
            createdAt: true,
          },
        }),
      ]);
      return {
        ok: true as const,
        records: rows.flatMap((row) => {
          const item = auditItem({
            id: row.id,
            action: row.action,
            resourceId: row.resourceId,
            details:
              row.details &&
              typeof row.details === "object" &&
              !Array.isArray(row.details)
                ? (row.details as Record<string, unknown>)
                : null,
            createdAt: row.createdAt.toISOString(),
          });
          return item ? [item] : [];
        }),
        total,
        page: input.page,
        pageSize: input.pageSize,
      };
    } catch (error) {
      return asFailure(error);
    }
  },
};

function proposalWhere(
  input: DnsListQuery,
): Prisma.BeyondMasterDnsProposalWhereInput {
  const query = input.query.trim();
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(input.recordType ? { recordType: input.recordType } : {}),
    ...(input.domain
      ? { domain: { contains: input.domain, mode: "insensitive" } }
      : {}),
    ...(input.customer ? { customerUserId: { contains: input.customer } } : {}),
    ...(input.verification === "verified" ? { verified: true } : {}),
    ...(input.verification === "unverified" ? { verified: null } : {}),
    ...(input.verification === "mismatch" ? { verified: false } : {}),
    ...(input.from || input.to
      ? {
          createdAt: {
            ...(input.from ? { gte: input.from } : {}),
            ...(input.to ? { lte: input.to } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { publicId: { contains: query, mode: "insensitive" } },
            { domain: { contains: query, mode: "insensitive" } },
            { host: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function asFailure(error: unknown): DnsReadFailure {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return {
      ok: false,
      status: 503,
      code: "migration_pending",
      error: DNS_ADMIN_MIGRATION_MESSAGE,
    };
  }
  return {
    ok: false,
    status: 503,
    code: "database",
    error: "DNS proposals could not be loaded.",
  };
}

function countsOf(rows: StoredProposal[]): DnsAdminCounts {
  return {
    total: rows.length,
    pending: rows.filter((row) => row.status === "pending").length,
    executed: rows.filter((row) => row.status === "executed").length,
    rejected: rows.filter((row) => row.providerStatus === "rejected").length,
    expired: rows.filter((row) => row.status === "expired").length,
    uncertain: rows.filter(
      (row) => row.providerStatus === "uncertain" || row.status === "executing",
    ).length,
    verifiedSuccess: rows.filter(
      (row) =>
        row.status === "executed" &&
        row.providerStatus === "accepted" &&
        row.verified === true,
    ).length,
    acceptedUnverified: rows.filter(
      (row) =>
        row.status === "executed" &&
        row.providerStatus === "accepted" &&
        row.verified == null,
    ).length,
  };
}

function listItem(row: StoredProposal): DnsAdminListItem {
  return {
    publicId: row.publicId,
    domain: row.domain,
    customerRef: customerRef(row.customerUserId),
    recordType: row.recordType,
    host: row.host,
    action: row.action,
    status: row.status,
    providerStatus: row.providerStatus,
    verification: verificationOf(row.providerStatus, row.verified),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function detailOf(row: StoredProposal): DnsAdminDetail {
  const uncertain =
    row.providerStatus === "uncertain" || row.status === "executing";
  return {
    ...listItem(row),
    value: row.value,
    ttl: row.ttl,
    priority: row.priority,
    recordId: row.recordId,
    snapshot: snapshotOf(row.snapshot),
    expiresAt: row.expiresAt,
    uncertainExplanation: uncertain ? DNS_UNCERTAIN_EXPLANATION : null,
  };
}

function verificationOf(
  providerStatus: string | null,
  verified: boolean | null,
): DnsVerificationLabel {
  if (verified === true && providerStatus === "accepted") return "verified";
  if (verified === false) return "mismatch";
  if (verified == null && providerStatus === "accepted") return "unverified";
  return "not_recorded";
}

function snapshotOf(value: unknown): DnsRecordSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const type = text(row.type);
  const host = text(row.host);
  const recordValue = text(row.value);
  if (!type || !host) return null;
  return {
    type,
    host,
    value: recordValue ?? "",
    ttl: whole(row.ttl),
    distance: whole(row.distance),
  };
}

function auditItem(row: StoredAudit): DnsAuditItem | null {
  if (row.action !== "BEYOND_MASTER_DNS") return null;
  const details = row.details ?? {};
  const providerStatus = text(details.providerStatus);
  const verified =
    details.verified === true
      ? true
      : details.verified === false
        ? false
        : null;
  return {
    id: row.id,
    action: "BEYOND_MASTER_DNS",
    domain: text(details.domain),
    proposalId: text(details.proposalId) ?? row.resourceId,
    recordAction: text(details.action),
    recordType: text(details.recordType),
    previous: snapshotOf(details.previous),
    next: nextOf(details.next),
    providerStatus,
    verification: verificationOf(providerStatus, verified),
    createdAt: row.createdAt,
  };
}

function nextOf(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const type = text(row.type);
  const host = text(row.host);
  if (!type || !host) return null;
  return {
    type,
    host,
    value: text(row.value) ?? "",
    ttl: whole(row.ttl),
    priority: whole(row.priority),
  };
}

function matchesProposal(row: StoredProposal, query: DnsListQuery) {
  if (query.status && row.status !== query.status) return false;
  if (query.recordType && row.recordType !== query.recordType) return false;
  if (query.domain && !row.domain.toLowerCase().includes(query.domain))
    return false;
  if (query.customer && !row.customerUserId.includes(query.customer))
    return false;
  if (query.verification === "verified" && row.verified !== true) return false;
  if (query.verification === "unverified" && row.verified !== null)
    return false;
  if (query.verification === "mismatch" && row.verified !== false) return false;
  if (query.from && new Date(row.createdAt).getTime() < query.from.getTime())
    return false;
  if (query.to && new Date(row.createdAt).getTime() > query.to.getTime())
    return false;
  const needle = query.query.toLowerCase();
  if (!needle) return true;
  return (
    row.publicId.toLowerCase().includes(needle) ||
    row.domain.toLowerCase().includes(needle) ||
    row.host.toLowerCase().includes(needle)
  );
}

function matchesAudit(
  row: StoredAudit,
  query: { publicId: string | null; domain: string },
) {
  if (row.action !== "BEYOND_MASTER_DNS") return false;
  if (
    query.publicId &&
    row.resourceId !== query.publicId &&
    text(row.details?.proposalId) !== query.publicId
  )
    return false;
  if (
    query.domain &&
    !(text(row.details?.domain) ?? "").toLowerCase().includes(query.domain)
  )
    return false;
  return true;
}

function dateRange(
  fromRaw: string | null,
  toRaw: string | null,
):
  | { ok: true; from: Date | null; to: Date | null }
  | { ok: false; error: string } {
  const from = fromRaw ? new Date(fromRaw) : null;
  const to = toRaw ? new Date(toRaw) : null;
  if (fromRaw && (!from || Number.isNaN(from.getTime())))
    return { ok: false, error: "Choose a start date." };
  if (toRaw && (!to || Number.isNaN(to.getTime())))
    return { ok: false, error: "Choose an end date." };
  if (from && to && from.getTime() > to.getTime())
    return { ok: false, error: "The start date must be before the end date." };
  if (from && to && to.getTime() - from.getTime() > MAX_RANGE_MS)
    return { ok: false, error: "Choose a range of 366 days or fewer." };
  return { ok: true, from, to };
}

function customerRef(id: string) {
  if (!id || id.includes("@") || id.length <= 8) return "customer";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function whole(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
