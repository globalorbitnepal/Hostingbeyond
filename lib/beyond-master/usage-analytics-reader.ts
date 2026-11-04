import { Prisma } from "@prisma/client";

import {
  SLOW_LATENCY_MS,
  type ParsedUsageQuery,
  type UsageActivityRow,
  type UsageFacts,
} from "@/lib/beyond-master/usage-analytics";
import { prisma } from "@/lib/prisma";

const rowSelect = {
  id: true,
  createdAt: true,
  provider: true,
  model: true,
  status: true,
  latencyMs: true,
  promptTokens: true,
  completionTokens: true,
  customerUserId: true,
  errorCode: true,
} as const;

export async function readBeyondMasterUsageFacts(
  query: ParsedUsageQuery,
): Promise<UsageFacts> {
  const where = whereInput(query);
  try {
    const statuses = await prisma.beyondMasterUsage.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    });
    const [
      providers,
      models,
      customers,
      totalRows,
      latency,
      tokens,
      slowCount,
      slowRows,
      rows,
      days,
      dns,
    ] = await Promise.all([
      prisma.beyondMasterUsage.groupBy({
        by: ["provider", "status"],
        where,
        _count: { _all: true },
      }),
      prisma.beyondMasterUsage.groupBy({
        by: ["model", "status"],
        where,
        _count: { _all: true },
      }),
      prisma.beyondMasterUsage.groupBy({
        by: ["customerUserId"],
        where: { ...where, customerUserId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { customerUserId: "desc" } },
        take: 10,
      }),
      prisma.beyondMasterUsage.count({ where }),
      prisma.beyondMasterUsage.aggregate({
        where,
        _avg: { latencyMs: true },
        _count: { latencyMs: true },
      }),
      prisma.beyondMasterUsage.aggregate({
        where,
        _sum: { promptTokens: true, completionTokens: true },
        _count: { promptTokens: true, completionTokens: true },
      }),
      prisma.beyondMasterUsage.count({
        where: { ...where, latencyMs: { gte: SLOW_LATENCY_MS } },
      }),
      prisma.beyondMasterUsage.findMany({
        where: { ...where, latencyMs: { gte: SLOW_LATENCY_MS } },
        orderBy: { latencyMs: "desc" },
        take: 5,
        select: rowSelect,
      }),
      prisma.beyondMasterUsage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: rowSelect,
      }),
      dailyCounts(query),
      dnsCounts(query),
    ]);
    return {
      available: true,
      statuses: statuses.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      providers: providers.map((row) => ({
        provider: row.provider,
        status: row.status,
        count: row._count._all,
      })),
      models: models.map((row) => ({
        model: row.model,
        status: row.status,
        count: row._count._all,
      })),
      days,
      customers: customers.flatMap((row) =>
        row.customerUserId
          ? [{ customerUserId: row.customerUserId, count: row._count._all }]
          : [],
      ),
      rows: rows.map(toRow),
      totalRows,
      averageLatencyMs:
        latency._count.latencyMs > 0 ? latency._avg.latencyMs : null,
      latencySamples: latency._count.latencyMs,
      slowCount,
      slowRows: slowRows.map(toRow),
      promptTokens:
        tokens._count.promptTokens > 0 ? tokens._sum.promptTokens : null,
      promptTokenRows: tokens._count.promptTokens,
      completionTokens:
        tokens._count.completionTokens > 0
          ? tokens._sum.completionTokens
          : null,
      completionTokenRows: tokens._count.completionTokens,
      dnsAvailable: dns.available,
      dns: dns.rows,
    };
  } catch (error) {
    if (isMissingTable(error)) return { available: false };
    throw new Error("usage_unavailable");
  }
}

function whereInput(
  query: ParsedUsageQuery,
): Prisma.BeyondMasterUsageWhereInput {
  return {
    createdAt: { gte: query.from, lt: query.to },
    ...(query.provider ? { provider: query.provider } : {}),
    ...(query.model ? { model: query.model } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
}

function whereSql(query: ParsedUsageQuery) {
  const parts = [
    Prisma.sql`"createdAt" >= ${query.from}`,
    Prisma.sql`"createdAt" < ${query.to}`,
  ];
  if (query.provider) parts.push(Prisma.sql`provider = ${query.provider}`);
  if (query.model) parts.push(Prisma.sql`model = ${query.model}`);
  if (query.status) parts.push(Prisma.sql`status = ${query.status}`);
  return Prisma.join(parts, " AND ");
}

async function dailyCounts(query: ParsedUsageQuery) {
  const rows = await prisma.$queryRaw<
    { day: string; status: string; count: number }[]
  >(Prisma.sql`
    SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
           status,
           COUNT(*)::int AS count
    FROM "BeyondMasterUsage"
    WHERE ${whereSql(query)}
    GROUP BY 1, 2
    ORDER BY 1
  `);
  return rows.map((row) => ({
    day: row.day,
    status: row.status,
    count: Number(row.count),
  }));
}

async function dnsCounts(query: ParsedUsageQuery) {
  try {
    const rows = await prisma.beyondMasterDnsProposal.groupBy({
      by: ["status", "providerStatus", "verified"],
      where: { createdAt: { gte: query.from, lt: query.to } },
      _count: { _all: true },
    });
    return {
      available: true,
      rows: rows.map((row) => ({
        status: row.status,
        providerStatus: row.providerStatus,
        verified: row.verified,
        count: row._count._all,
      })),
    };
  } catch (error) {
    if (isMissingTable(error)) return { available: false, rows: [] };
    throw error;
  }
}

function toRow(row: {
  id: string;
  createdAt: Date;
  provider: string;
  model: string;
  status: string;
  latencyMs: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  customerUserId: string | null;
  errorCode: string | null;
}): UsageActivityRow {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

function isMissingTable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}
