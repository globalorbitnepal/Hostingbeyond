import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const SECURITY_RANGE_MS = 90 * 24 * 60 * 60 * 1000;

export const SECURITY_CATEGORIES = [
  "dns",
  "ticket",
  "usage",
  "authentication",
] as const;

export type SecurityCategory = (typeof SECURITY_CATEGORIES)[number];

export type SecuritySection =
  { available: false; message: string } | { available: true; count: number };

export type SecurityEvent = {
  id: string;
  createdAt: string;
  category: SecurityCategory;
  action: string;
  resourceRef: string | null;
  status: string | null;
  description: string;
};

export type SecurityQuery = {
  category: SecurityCategory | null;
  action: string | null;
  status: string | null;
  from: Date;
  to: Date;
  page: number;
  pageSize: number;
};

export type SecurityFailure = {
  ok: false;
  status: number;
  code: string;
  error: string;
};

export type SecuritySnapshot = {
  ok: true;
  sections: {
    dns: SecuritySection;
    tickets: SecuritySection;
    accountReads: SecuritySection;
    aiFailures: SecuritySection;
    authentication: SecuritySection;
  };
  events: SecurityEvent[];
  total: number;
  page: number;
  pageSize: number;
};

type SourceRows =
  | {
      available: true;
      count: number;
      summary: number;
      accountReads: number;
      aiFailures: number;
      events: SecurityEvent[];
    }
  | { available: false; message: string };

export type SecurityRepository = {
  dns(query: SecurityQuery, take: number): Promise<SourceRows>;
  tickets(query: SecurityQuery, take: number): Promise<SourceRows>;
  usage(query: SecurityQuery, take: number): Promise<SourceRows>;
  authentication(query: SecurityQuery, take: number): Promise<SourceRows>;
};

const AUTH_ACTIONS = ["LOGIN", "LOGOUT", "LOGIN_FAILED", "ENROLL"] as const;

let repositoryOverride: SecurityRepository | null = null;

export function setBeyondMasterSecurityRepositoryForTests(
  repository: SecurityRepository | null,
) {
  if (process.env.NODE_ENV === "production") return;
  repositoryOverride = repository;
}

export function getBeyondMasterSecurityRepository(): SecurityRepository {
  if (process.env.NODE_ENV !== "production" && repositoryOverride)
    return repositoryOverride;
  return prismaSecurityRepository;
}

export function parseSecurityQuery(
  url: URL,
  now = new Date(),
): { ok: true; value: SecurityQuery } | { ok: false; error: string } {
  const categoryRaw = url.searchParams.get("category");
  const category =
    categoryRaw &&
    (SECURITY_CATEGORIES as readonly string[]).includes(categoryRaw)
      ? (categoryRaw as SecurityCategory)
      : null;
  if (categoryRaw && !category)
    return { ok: false, error: "Choose an event category." };
  const action = (url.searchParams.get("action") ?? "").trim();
  if (action && !/^[A-Za-z0-9_-]{1,40}$/.test(action))
    return { ok: false, error: "Choose an event action." };
  const status = (url.searchParams.get("status") ?? "").trim();
  if (status && !/^[A-Za-z0-9_-]{1,40}$/.test(status))
    return { ok: false, error: "Choose a status." };
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  const from = fromRaw
    ? new Date(fromRaw)
    : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const to = toRaw ? new Date(toRaw) : now;
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()))
    return { ok: false, error: "Choose a valid date range." };
  if (from.getTime() > to.getTime())
    return { ok: false, error: "The start date must be before the end date." };
  if (to.getTime() - from.getTime() > SECURITY_RANGE_MS)
    return { ok: false, error: "Choose a range of 90 days or fewer." };
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  if (!Number.isInteger(page) || page < 1 || page > 20)
    return { ok: false, error: "Choose a page." };
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50)
    return { ok: false, error: "Page size must be 50 or fewer." };
  return {
    ok: true,
    value: {
      category,
      action: action || null,
      status: status || null,
      from,
      to,
      page,
      pageSize,
    },
  };
}

export async function adminSecurityAudit(
  adminId: string | null,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseSecurityQuery(new URL(request.url));
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });
  const snapshot = await loadSecuritySnapshot(
    getBeyondMasterSecurityRepository(),
    parsed.value,
  );
  return Response.json(publicSnapshot(snapshot));
}

export async function loadSecuritySnapshot(
  repository: SecurityRepository,
  query: SecurityQuery,
): Promise<SecuritySnapshot> {
  const take = query.category ? query.pageSize : query.page * query.pageSize;
  const skip = query.category ? (query.page - 1) * query.pageSize : 0;
  const [dns, tickets, usage, authentication] = await Promise.all([
    query.category && query.category !== "dns"
      ? emptySource()
      : repository.dns(query, take),
    query.category && query.category !== "ticket"
      ? emptySource()
      : repository.tickets(query, take),
    query.category && query.category !== "usage"
      ? emptySource()
      : repository.usage(query, take),
    query.category && query.category !== "authentication"
      ? emptySource()
      : repository.authentication(query, take),
  ]);
  const available = [dns, tickets, usage, authentication].filter(
    (source) => source.available,
  );
  const merged = available
    .flatMap((source) => (source.available ? source.events : []))
    .sort(
      (left, right) =>
        right.createdAt.localeCompare(left.createdAt) ||
        left.id.localeCompare(right.id),
    );
  const events = query.category
    ? merged
    : merged.slice(skip, skip + query.pageSize);
  const total = available.reduce(
    (sum, source) => sum + (source.available ? source.count : 0),
    0,
  );
  return {
    ok: true,
    sections: {
      dns: section(dns, query.category === null || query.category === "dns"),
      tickets: section(
        tickets,
        query.category === null || query.category === "ticket",
      ),
      accountReads: usageMetric(usage, "accountReads", query),
      aiFailures: usageMetric(usage, "aiFailures", query),
      authentication: section(
        authentication,
        query.category === null || query.category === "authentication",
      ),
    },
    events,
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export function createMemorySecurityRepository(input: {
  dns?: SecurityEvent[];
  tickets?: SecurityEvent[];
  usage?: SecurityEvent[];
  authentication?: SecurityEvent[];
  missing?: SecurityCategory[];
}): SecurityRepository {
  const missing = new Set(input.missing ?? []);
  const source = (
    category: SecurityCategory,
    rows: SecurityEvent[] | undefined,
  ) => {
    return async (query: SecurityQuery, take: number): Promise<SourceRows> => {
      if (missing.has(category)) {
        return { available: false, message: unavailableMessage(category) };
      }
      const ranged = (rows ?? []).filter((event) => inRange(event, query));
      const filtered = ranged.filter((event) => matchesFilters(event, query));
      const start = query.category ? (query.page - 1) * query.pageSize : 0;
      return {
        available: true,
        summary: ranged.length,
        count: filtered.length,
        accountReads: ranged.filter((event) => event.action === "account_read")
          .length,
        aiFailures: ranged.filter(
          (event) => event.action === "error" || event.action === "timeout",
        ).length,
        events: filtered.sort(byTime).slice(start, start + take),
      };
    };
  };
  return {
    dns: source("dns", input.dns),
    tickets: source("ticket", input.tickets),
    usage: source("usage", input.usage),
    authentication: source("authentication", input.authentication),
  };
}

const prismaSecurityRepository: SecurityRepository = {
  async dns(query, take) {
    try {
      const where: Prisma.DomainAuditLogWhereInput = {
        action: "BEYOND_MASTER_DNS",
        createdAt: { gte: query.from, lte: query.to },
        ...(query.action || query.status
          ? {
              AND: [
                ...(query.action
                  ? [{ details: { path: ["action"], equals: query.action } }]
                  : []),
                ...(query.status
                  ? [
                      {
                        details: {
                          path: ["providerStatus"],
                          equals: query.status,
                        },
                      },
                    ]
                  : []),
              ],
            }
          : {}),
      };
      const summaryWhere: Prisma.DomainAuditLogWhereInput = {
        action: "BEYOND_MASTER_DNS",
        createdAt: { gte: query.from, lte: query.to },
      };
      const [summary, count, rows] = await Promise.all([
        prisma.domainAuditLog.count({ where: summaryWhere }),
        prisma.domainAuditLog.count({ where }),
        prisma.domainAuditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: query.category ? (query.page - 1) * query.pageSize : 0,
          take,
          select: {
            id: true,
            createdAt: true,
            resourceId: true,
            details: true,
          },
        }),
      ]);
      return {
        available: true,
        summary,
        count,
        accountReads: 0,
        aiFailures: 0,
        events: rows.map((row) => {
          const details = objectOf(row.details);
          const recordAction = safeToken(details.action) ?? "recorded";
          const domain = safeLabel(details.domain);
          return {
            id: `dns:${row.id}`,
            createdAt: row.createdAt.toISOString(),
            category: "dns" as const,
            action: recordAction,
            resourceRef: domain ?? safeLabel(row.resourceId),
            status: safeToken(details.providerStatus),
            description: `DNS ${recordAction}${domain ? ` on ${domain}` : ""}`,
          };
        }),
      };
    } catch (error) {
      return sourceFailure(error, "dns");
    }
  },
  async tickets(query, take) {
    try {
      const where: Prisma.BeyondMasterTicketActivityWhereInput = {
        createdAt: { gte: query.from, lte: query.to },
        ...(query.action ? { action: query.action } : {}),
        ...(query.status ? { actorType: query.status } : {}),
      };
      const summaryWhere: Prisma.BeyondMasterTicketActivityWhereInput = {
        createdAt: { gte: query.from, lte: query.to },
      };
      const [summary, count, rows] = await Promise.all([
        prisma.beyondMasterTicketActivity.count({ where: summaryWhere }),
        prisma.beyondMasterTicketActivity.count({ where }),
        prisma.beyondMasterTicketActivity.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: query.category ? (query.page - 1) * query.pageSize : 0,
          take,
          select: {
            id: true,
            createdAt: true,
            action: true,
            actorType: true,
            ticket: { select: { reference: true } },
          },
        }),
      ]);
      return {
        available: true,
        summary,
        count,
        accountReads: 0,
        aiFailures: 0,
        events: rows.map((row) => ({
          id: `ticket:${row.id}`,
          createdAt: row.createdAt.toISOString(),
          category: "ticket" as const,
          action: safeToken(row.action) ?? "activity",
          resourceRef: safeLabel(row.ticket.reference),
          status: safeToken(row.actorType),
          description: `Ticket ${safeLabel(row.ticket.reference) ?? "activity"} ${safeToken(row.action) ?? "updated"}`,
        })),
      };
    } catch (error) {
      return sourceFailure(error, "ticket");
    }
  },
  async usage(query, take) {
    try {
      const where: Prisma.BeyondMasterUsageWhereInput = {
        createdAt: { gte: query.from, lte: query.to },
        ...(query.action ? { status: query.action } : {}),
        ...(query.status
          ? { OR: [{ status: query.status }, { errorCode: query.status }] }
          : {}),
      };
      const range = { createdAt: { gte: query.from, lte: query.to } };
      const [summary, accountReads, aiFailures, count, rows] =
        await Promise.all([
          prisma.beyondMasterUsage.count({ where: range }),
          prisma.beyondMasterUsage.count({
            where: { ...range, status: "account_read" },
          }),
          prisma.beyondMasterUsage.count({
            where: { ...range, status: { in: ["error", "timeout"] } },
          }),
          prisma.beyondMasterUsage.count({ where }),
          prisma.beyondMasterUsage.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: query.category ? (query.page - 1) * query.pageSize : 0,
            take,
            select: {
              id: true,
              createdAt: true,
              provider: true,
              status: true,
              errorCode: true,
            },
          }),
        ]);
      return {
        available: true,
        summary,
        count,
        accountReads,
        aiFailures,
        events: rows.map((row) => ({
          id: `usage:${row.id}`,
          createdAt: row.createdAt.toISOString(),
          category: "usage" as const,
          action: safeToken(row.status) ?? "usage",
          resourceRef: safeToken(row.provider),
          status: safeToken(row.errorCode) ?? safeToken(row.status),
          description: `${safeToken(row.provider) ?? "provider"} ${safeToken(row.status) ?? "request"}`,
        })),
      };
    } catch (error) {
      return sourceFailure(error, "usage");
    }
  },
  async authentication(query, take) {
    try {
      const summaryWhere: Prisma.ActivityLogWhereInput = {
        action: { in: [...AUTH_ACTIONS] },
        createdAt: { gte: query.from, lte: query.to },
      };
      if (query.action && query.status && query.action !== query.status) {
        const summary = await prisma.activityLog.count({ where: summaryWhere });
        return {
          available: true,
          summary,
          count: 0,
          accountReads: 0,
          aiFailures: 0,
          events: [],
        };
      }
      if (
        query.action &&
        !(AUTH_ACTIONS as readonly string[]).includes(query.action)
      ) {
        const summary = await prisma.activityLog.count({ where: summaryWhere });
        return {
          available: true,
          summary,
          count: 0,
          accountReads: 0,
          aiFailures: 0,
          events: [],
        };
      }
      if (
        query.status &&
        !(AUTH_ACTIONS as readonly string[]).includes(query.status)
      ) {
        const summary = await prisma.activityLog.count({ where: summaryWhere });
        return {
          available: true,
          summary,
          count: 0,
          accountReads: 0,
          aiFailures: 0,
          events: [],
        };
      }
      const where: Prisma.ActivityLogWhereInput = {
        action: (query.action as (typeof AUTH_ACTIONS)[number] | null) ??
          (query.status as (typeof AUTH_ACTIONS)[number] | null) ?? {
            in: [...AUTH_ACTIONS],
          },
        createdAt: { gte: query.from, lte: query.to },
      };
      const [summary, count, rows] = await Promise.all([
        prisma.activityLog.count({ where: summaryWhere }),
        prisma.activityLog.count({ where }),
        prisma.activityLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: query.category ? (query.page - 1) * query.pageSize : 0,
          take,
          select: { id: true, createdAt: true, action: true, resource: true },
        }),
      ]);
      const events = rows.map((row) => ({
        id: `auth:${row.id}`,
        createdAt: row.createdAt.toISOString(),
        category: "authentication" as const,
        action: row.action,
        resourceRef: safeLabel(row.resource),
        status: row.action,
        description: `Orbit ${row.action.toLowerCase().replaceAll("_", " ")}`,
      }));
      return {
        available: true,
        summary,
        count,
        accountReads: 0,
        aiFailures: 0,
        events,
      };
    } catch (error) {
      return sourceFailure(error, "authentication");
    }
  },
};

function publicSnapshot(snapshot: SecuritySnapshot) {
  return {
    available: true,
    sections: snapshot.sections,
    events: snapshot.events,
    total: snapshot.total,
    page: snapshot.page,
    pageSize: snapshot.pageSize,
    rateLimit: {
      scope: "process-local",
      note: "Beyond Master chat, DNS, account, and ticket limits use an in-memory fixed window in this Node process. They are not shared across PM2 instances.",
    },
  };
}

function section(source: SourceRows, included: boolean): SecuritySection {
  if (!included) return { available: true, count: 0 };
  if (!source.available) return source;
  return { available: true, count: source.summary };
}

function usageMetric(
  source: SourceRows,
  key: "accountReads" | "aiFailures",
  query: SecurityQuery,
): SecuritySection {
  if (query.category && query.category !== "usage")
    return { available: true, count: 0 };
  if (!source.available) return source;
  return { available: true, count: source[key] };
}

function emptySource(): SourceRows {
  return {
    available: true,
    summary: 0,
    count: 0,
    accountReads: 0,
    aiFailures: 0,
    events: [],
  };
}

function inRange(event: SecurityEvent, query: SecurityQuery) {
  const time = new Date(event.createdAt).getTime();
  return time >= query.from.getTime() && time <= query.to.getTime();
}

function matchesFilters(event: SecurityEvent, query: SecurityQuery) {
  if (query.action && event.action !== query.action) return false;
  if (query.status && event.status !== query.status) return false;
  return true;
}

function byTime(left: SecurityEvent, right: SecurityEvent) {
  return (
    right.createdAt.localeCompare(left.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

function unavailableMessage(category: SecurityCategory) {
  if (category === "dns")
    return "DNS audit records are unavailable until that table can be read.";
  if (category === "ticket")
    return "Ticket activity is unavailable until the ticket migration is applied.";
  if (category === "usage")
    return "AI usage events are unavailable until the usage migration is applied.";
  return "Authentication events are unavailable until the activity log can be read.";
}

function sourceFailure(error: unknown, category: SecurityCategory): SourceRows {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return { available: false, message: unavailableMessage(category) };
  }
  return { available: false, message: unavailableMessage(category) };
}

function objectOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function safeToken(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_.:-]{1,40}$/.test(value)
    ? value
    : null;
}

function safeLabel(value: unknown) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (
    !text ||
    text.length > 80 ||
    text.includes("@") ||
    /sk-|api[_-]?key|claim|password|secret/i.test(text)
  )
    return null;
  return text;
}
