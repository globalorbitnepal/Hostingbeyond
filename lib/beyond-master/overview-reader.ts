import { Prisma } from "@prisma/client";

import type { OverviewFacts } from "@/lib/beyond-master/overview";
import { prisma } from "@/lib/prisma";

export async function readBeyondMasterOverviewFacts(): Promise<OverviewFacts> {
  const [usageTable, knowledgeTable, ticketTable, dnsTable] = await Promise.all(
    [
      tableReady(() =>
        prisma.beyondMasterUsage.findFirst({ select: { id: true } }),
      ),
      tableReady(() =>
        prisma.beyondMasterKnowledgeArticle.findFirst({ select: { id: true } }),
      ),
      tableReady(() =>
        prisma.beyondMasterTicket.findFirst({ select: { id: true } }),
      ),
      tableReady(() =>
        prisma.beyondMasterDnsProposal.findFirst({ select: { id: true } }),
      ),
    ],
  );
  if (!usageTable && !dnsTable) {
    return emptyFacts({ usageTable, knowledgeTable, ticketTable, dnsTable });
  }
  try {
    const requests = usageTable
      ? await prisma.beyondMasterUsage.groupBy({
          by: ["status"],
          _count: { _all: true },
        })
      : [];
    const providers = usageTable
      ? await prisma.beyondMasterUsage.groupBy({
          by: ["provider"],
          _count: { _all: true },
        })
      : [];
    const latency = usageTable
      ? await prisma.beyondMasterUsage.aggregate({
          _avg: { latencyMs: true },
          _count: { latencyMs: true },
        })
      : null;
    const dnsExecuted = dnsTable
      ? await prisma.beyondMasterDnsProposal.count({
          where: { status: "executed" },
        })
      : null;
    return {
      usageTable,
      knowledgeTable,
      ticketTable,
      dnsTable,
      requests: requests.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      providers: providers.map((row) => ({
        provider: row.provider,
        count: row._count._all,
      })),
      averageLatencyMs:
        latency && latency._count.latencyMs > 0 ? latency._avg.latencyMs : null,
      dnsExecuted,
    };
  } catch (error) {
    if (isMissingTable(error)) {
      return emptyFacts({
        usageTable: false,
        knowledgeTable,
        ticketTable,
        dnsTable: false,
      });
    }
    throw new Error("overview_unavailable");
  }
}

function emptyFacts(flags: {
  usageTable: boolean;
  knowledgeTable: boolean;
  ticketTable: boolean;
  dnsTable: boolean;
}): OverviewFacts {
  return {
    ...flags,
    requests: [],
    providers: [],
    averageLatencyMs: null,
    dnsExecuted: null,
  };
}

async function tableReady(query: () => Promise<unknown>) {
  try {
    await query();
    return true;
  } catch (error) {
    if (isMissingTable(error)) return false;
    throw new Error("overview_unavailable");
  }
}

function isMissingTable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  );
}
