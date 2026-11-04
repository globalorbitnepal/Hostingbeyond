import { beyondMasterAdminStatus } from "@/lib/beyond-master/settings";

export const USAGE_MIGRATION_MESSAGE =
  "Usage analytics are unavailable until the database migration is applied.";

export const DNS_COUNT_MIGRATION_MESSAGE =
  "DNS operation counts are unavailable until the proposal migration is applied.";

export type ModuleStatus =
  | "Available"
  | "Configured"
  | "Migration Pending"
  | "Not Configured"
  | "Read-only"
  | "Coming Later";

export type OverviewModule = {
  name: string;
  status: ModuleStatus;
  detail: string;
};

export type OverviewUsage =
  | {
      available: false;
      message: string;
    }
  | {
      available: true;
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      accountReads: number;
      averageLatencyMs: number | null;
      providers: { provider: string; requests: number }[];
      dnsOperations: number | null;
      dnsMessage: string | null;
    };

export type BeyondMasterOverview = {
  product: "AI Agent";
  readOnly: true;
  ai: {
    provider: string;
    model: string;
    host: string;
    apiKeyConfigured: "Yes" | "No";
    timeoutMs: number;
    rateLimit: string;
  };
  modules: OverviewModule[];
  usage: OverviewUsage;
  note: string;
};

export type OverviewFacts = {
  usageTable: boolean;
  knowledgeTable: boolean;
  ticketTable: boolean;
  dnsTable: boolean;
  requests: { status: string; count: number }[];
  providers: { provider: string; count: number }[];
  averageLatencyMs: number | null;
  dnsExecuted: number | null;
};

const EMPTY_FACTS: OverviewFacts = {
  usageTable: false,
  knowledgeTable: false,
  ticketTable: false,
  dnsTable: false,
  requests: [],
  providers: [],
  averageLatencyMs: null,
  dnsExecuted: null,
};

export async function respondToBeyondMasterOverview(input: {
  admin: { id: string } | null;
  loadFacts: () => Promise<OverviewFacts>;
  env?: Record<string, string | undefined>;
}): Promise<
  | { status: 401; body: { error: string } }
  | { status: 503; body: { error: string } }
  | { status: 200; body: BeyondMasterOverview }
> {
  if (!input.admin) return { status: 401, body: { error: "Unauthorized" } };
  try {
    const facts = await input.loadFacts();
    return { status: 200, body: buildBeyondMasterOverview(input.env, facts) };
  } catch {
    return {
      status: 503,
      body: { error: "The Beyond Master overview could not be loaded." },
    };
  }
}

export function buildBeyondMasterOverview(
  env: Record<string, string | undefined> = process.env,
  facts: OverviewFacts = EMPTY_FACTS,
): BeyondMasterOverview {
  const status = beyondMasterAdminStatus(env);
  const usage = facts.usageTable ? usageFrom(facts) : unavailableUsage();
  return {
    product: "AI Agent",
    readOnly: true,
    ai: {
      provider: status.provider ?? "Not configured",
      model: status.model ?? "Not configured",
      host: status.baseUrlHost ?? "Not configured",
      apiKeyConfigured: status.credentialsPresent ? "Yes" : "No",
      timeoutMs: status.timeoutMs,
      rateLimit: `${status.rateLimit} requests / ${Math.round(status.rateWindowMs / 1000)} seconds`,
    },
    modules: [
      {
        name: "AI Provider",
        status: status.configured ? "Configured" : "Not Configured",
        detail: status.configured
          ? "The server has a provider, model, and credential. This screen cannot change them."
          : "A provider, model, or credential is missing. No sample provider is shown.",
      },
      {
        name: "Knowledge Base",
        status: "Read-only",
        detail: facts.knowledgeTable
          ? "Built-in articles can answer questions. Article editing is not on this screen."
          : "Built-in articles can answer questions. Operator article storage is waiting for its database migration.",
      },
      {
        name: "Support Tickets",
        status: facts.ticketTable ? "Read-only" : "Migration Pending",
        detail: facts.ticketTable
          ? "Ticket storage is present. Ticket management is not on this screen."
          : "Ticket storage is waiting for its database migration, so tickets are not treated as operational.",
      },
      {
        name: "Account Intelligence",
        status: "Read-only",
        detail:
          "A signed-in customer can be shown that customer's own records. This overview does not list customer accounts.",
      },
      {
        name: "DNS Automation",
        status: facts.dnsTable ? "Read-only" : "Migration Pending",
        detail: facts.dnsTable
          ? "A customer must confirm a stored proposal before a DNS write. This screen cannot execute DNS changes."
          : "DNS proposals wait for their database migration. This screen cannot execute DNS changes.",
      },
      {
        name: "Usage Tracking",
        status: facts.usageTable ? "Read-only" : "Migration Pending",
        detail: facts.usageTable
          ? "Request totals below come from stored usage rows. Prompt text is not stored."
          : USAGE_MIGRATION_MESSAGE,
      },
    ],
    usage,
    note: "Conversation transcripts, provider settings, knowledge editing, ticket management, DNS controls, and human handoff are not included on this screen.",
  };
}

function unavailableUsage(): OverviewUsage {
  return { available: false, message: USAGE_MIGRATION_MESSAGE };
}

function usageFrom(facts: OverviewFacts): OverviewUsage {
  const count = (status: string) =>
    facts.requests.find((row) => row.status === status)?.count ?? 0;
  const totalRequests = facts.requests.reduce((sum, row) => sum + row.count, 0);
  return {
    available: true,
    totalRequests,
    successfulRequests: count("success"),
    failedRequests: count("error") + count("timeout"),
    accountReads: count("account_read"),
    averageLatencyMs: facts.averageLatencyMs,
    providers: facts.providers.map((row) => ({
      provider: row.provider,
      requests: row.count,
    })),
    dnsOperations: facts.dnsTable ? facts.dnsExecuted : null,
    dnsMessage: facts.dnsTable ? null : DNS_COUNT_MIGRATION_MESSAGE,
  };
}
