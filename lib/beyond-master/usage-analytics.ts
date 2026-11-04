import { USAGE_MIGRATION_MESSAGE } from "@/lib/beyond-master/overview";

export const USAGE_STATUSES = [
  "success",
  "error",
  "timeout",
  "unconfigured",
  "rate_limited",
  "aborted",
  "account_read",
] as const;

export type UsageStatus = (typeof USAGE_STATUSES)[number];

export const DNS_ANALYTICS_MIGRATION_MESSAGE =
  "DNS proposal analytics require the DNS proposal migration. Proposal rows are not counted as executed DNS writes.";

export const SLOW_LATENCY_MS = 8_000;
const MAX_RANGE_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_PAGE = 100;
const MAX_PAGE_SIZE = 50;

export type UsageRange = "24h" | "7d" | "30d" | "custom";

export type ParsedUsageQuery = {
  range: UsageRange;
  from: Date;
  to: Date;
  provider: string | null;
  model: string | null;
  status: UsageStatus | null;
  page: number;
  pageSize: number;
};

export type UsageStatusCount = { status: string; count: number };
export type UsageProviderCount = {
  provider: string;
  status: string;
  count: number;
};
export type UsageModelCount = { model: string; status: string; count: number };
export type UsageDayCount = { day: string; status: string; count: number };
export type UsageCustomerCount = { customerUserId: string; count: number };
export type UsageActivityRow = {
  id: string;
  createdAt: string;
  provider: string;
  model: string;
  status: string;
  latencyMs: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  customerUserId: string | null;
  errorCode: string | null;
};
export type UsageDnsCount = {
  status: string;
  providerStatus: string | null;
  verified: boolean | null;
  count: number;
};

export type UsageFacts =
  | { available: false }
  | {
      available: true;
      statuses: UsageStatusCount[];
      providers: UsageProviderCount[];
      models: UsageModelCount[];
      days: UsageDayCount[];
      customers: UsageCustomerCount[];
      rows: UsageActivityRow[];
      totalRows: number;
      averageLatencyMs: number | null;
      latencySamples: number;
      slowCount: number;
      slowRows: UsageActivityRow[];
      promptTokens: number | null;
      promptTokenRows: number;
      completionTokens: number | null;
      completionTokenRows: number;
      dnsAvailable: boolean;
      dns: UsageDnsCount[];
    };

export type UsageAnalytics =
  | { available: false; migrationPending: true; message: string }
  | {
      available: true;
      migrationPending: false;
      range: { from: string; to: string };
      page: number;
      pageSize: number;
      totalRows: number;
      summary: {
        totalRequests: number;
        successfulAi: number;
        failed: number;
        accountReads: number;
        unconfigured: number;
        rateLimited: number;
        aborted: number;
        averageLatencyMs: number | null;
        slowRequests: number;
      };
      providers: {
        provider: string;
        requests: number;
        successfulAi: number;
        failed: number;
      }[];
      models: { model: string; requests: number; successfulAi: number }[];
      daily: {
        day: string;
        requests: number;
        successfulAi: number;
        failed: number;
        accountReads: number;
      }[];
      tokens: {
        promptTokens: number | null;
        completionTokens: number | null;
        totalTokens: number | null;
      };
      customers: { customerRef: string; requests: number }[];
      slow: {
        createdAt: string;
        provider: string;
        model: string;
        latencyMs: number | null;
        status: string;
      }[];
      dns:
        | { available: false; message: string }
        | {
            available: true;
            proposals: number;
            executedVerified: number;
            acceptedUnverified: number;
            verificationMismatch: number;
            uncertain: number;
          };
      rows: {
        id: string;
        createdAt: string;
        provider: string;
        model: string;
        status: string;
        latencyMs: number | null;
        promptTokens: number | null;
        completionTokens: number | null;
        customerRef: string | null;
        errorCode: string | null;
      }[];
      empty: boolean;
    };

export function parseUsageQuery(
  params: URLSearchParams,
  now = new Date(),
): { ok: true; query: ParsedUsageQuery } | { ok: false; error: string } {
  const rangeRaw = params.get("range") ?? "7d";
  if (
    rangeRaw !== "24h" &&
    rangeRaw !== "7d" &&
    rangeRaw !== "30d" &&
    rangeRaw !== "custom"
  ) {
    return { ok: false, error: "Choose a date range." };
  }
  const page = wholeNumber(params.get("page"), 1);
  const pageSize = wholeNumber(params.get("pageSize"), 20);
  if (page == null || page < 1 || page > MAX_PAGE)
    return { ok: false, error: "That page is outside the allowed range." };
  if (pageSize == null || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return { ok: false, error: "Page size must be from 1 to 50." };
  }
  const provider = optionalLabel(params.get("provider"), 40);
  const model = optionalLabel(params.get("model"), 80);
  if (provider === "invalid" || model === "invalid")
    return { ok: false, error: "That provider or model filter is not valid." };
  const statusRaw = params.get("status")?.trim() ?? "";
  if (statusRaw && !USAGE_STATUSES.includes(statusRaw as UsageStatus)) {
    return { ok: false, error: "That status filter is not valid." };
  }
  const window = dateWindow(
    rangeRaw,
    params.get("from"),
    params.get("to"),
    now,
  );
  if (!window.ok) return window;
  return {
    ok: true,
    query: {
      range: rangeRaw,
      from: window.from,
      to: window.to,
      provider,
      model,
      status: statusRaw ? (statusRaw as UsageStatus) : null,
      page,
      pageSize,
    },
  };
}

export async function respondToBeyondMasterUsage(input: {
  admin: { id: string } | null;
  params: URLSearchParams;
  now?: Date;
  load: (query: ParsedUsageQuery) => Promise<UsageFacts>;
}): Promise<
  | { status: 401; body: { error: string } }
  | { status: 400; body: { error: string } }
  | { status: 503; body: { error: string } }
  | { status: 200; body: UsageAnalytics }
> {
  if (!input.admin) return { status: 401, body: { error: "Unauthorized" } };
  const parsed = parseUsageQuery(input.params, input.now ?? new Date());
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };
  try {
    const facts = await input.load(parsed.query);
    return { status: 200, body: buildUsageAnalytics(parsed.query, facts) };
  } catch {
    return {
      status: 503,
      body: { error: "Usage analytics could not be loaded." },
    };
  }
}

export function buildUsageAnalytics(
  query: ParsedUsageQuery,
  facts: UsageFacts,
): UsageAnalytics {
  if (!facts.available) {
    return {
      available: false,
      migrationPending: true,
      message: USAGE_MIGRATION_MESSAGE,
    };
  }
  const count = (status: string) =>
    facts.statuses.find((row) => row.status === status)?.count ?? 0;
  const totalRequests = facts.statuses.reduce((sum, row) => sum + row.count, 0);
  const providers = new Map<
    string,
    { requests: number; successfulAi: number; failed: number }
  >();
  for (const row of facts.providers) {
    const current = providers.get(row.provider) ?? {
      requests: 0,
      successfulAi: 0,
      failed: 0,
    };
    current.requests += row.count;
    if (row.status === "success") current.successfulAi += row.count;
    if (row.status === "error" || row.status === "timeout")
      current.failed += row.count;
    providers.set(row.provider, current);
  }
  const models = new Map<string, { requests: number; successfulAi: number }>();
  for (const row of facts.models) {
    const current = models.get(row.model) ?? { requests: 0, successfulAi: 0 };
    current.requests += row.count;
    if (row.status === "success") current.successfulAi += row.count;
    models.set(row.model, current);
  }
  const days = new Map<
    string,
    {
      requests: number;
      successfulAi: number;
      failed: number;
      accountReads: number;
    }
  >();
  for (const row of facts.days) {
    const current = days.get(row.day) ?? {
      requests: 0,
      successfulAi: 0,
      failed: 0,
      accountReads: 0,
    };
    current.requests += row.count;
    if (row.status === "success") current.successfulAi += row.count;
    if (row.status === "error" || row.status === "timeout")
      current.failed += row.count;
    if (row.status === "account_read") current.accountReads += row.count;
    days.set(row.day, current);
  }
  const promptTokens = facts.promptTokenRows > 0 ? facts.promptTokens : null;
  const completionTokens =
    facts.completionTokenRows > 0 ? facts.completionTokens : null;
  return {
    available: true,
    migrationPending: false,
    range: { from: query.from.toISOString(), to: query.to.toISOString() },
    page: query.page,
    pageSize: query.pageSize,
    totalRows: facts.totalRows,
    summary: {
      totalRequests,
      successfulAi: count("success"),
      failed: count("error") + count("timeout"),
      accountReads: count("account_read"),
      unconfigured: count("unconfigured"),
      rateLimited: count("rate_limited"),
      aborted: count("aborted"),
      averageLatencyMs:
        facts.latencySamples > 0 ? facts.averageLatencyMs : null,
      slowRequests: facts.slowCount,
    },
    providers: [...providers.entries()].map(([provider, value]) => ({
      provider,
      ...value,
    })),
    models: [...models.entries()].map(([model, value]) => ({
      model,
      ...value,
    })),
    daily: [...days.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([day, value]) => ({ day, ...value })),
    tokens: {
      promptTokens,
      completionTokens,
      totalTokens:
        promptTokens == null && completionTokens == null
          ? null
          : (promptTokens ?? 0) + (completionTokens ?? 0),
    },
    customers: facts.customers.map((row) => ({
      customerRef: protectCustomerRef(row.customerUserId),
      requests: row.count,
    })),
    slow: facts.slowRows.map((row) => ({
      createdAt: row.createdAt,
      provider: row.provider,
      model: row.model,
      latencyMs: row.latencyMs,
      status: row.status,
    })),
    dns: facts.dnsAvailable
      ? dnsSummary(facts.dns)
      : { available: false, message: DNS_ANALYTICS_MIGRATION_MESSAGE },
    rows: facts.rows.map(publicRow),
    empty: totalRequests === 0,
  };
}

export function protectCustomerRef(id: string | null): string {
  if (!id || id.includes("@")) return "customer";
  if (id.length <= 8) return "customer";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function publicRow(row: UsageActivityRow) {
  return {
    id: row.id,
    createdAt: row.createdAt,
    provider: row.provider,
    model: row.model,
    status: row.status,
    latencyMs: row.latencyMs,
    promptTokens: row.promptTokens,
    completionTokens: row.completionTokens,
    customerRef: row.customerUserId
      ? protectCustomerRef(row.customerUserId)
      : null,
    errorCode: row.errorCode,
  };
}

function dnsSummary(rows: UsageDnsCount[]) {
  let proposals = 0;
  let executedVerified = 0;
  let acceptedUnverified = 0;
  let verificationMismatch = 0;
  let uncertain = 0;
  for (const row of rows) {
    proposals += row.count;
    if (row.providerStatus === "uncertain") uncertain += row.count;
    if (row.status !== "executed") continue;
    if (row.verified === true && row.providerStatus === "accepted")
      executedVerified += row.count;
    else if (row.verified == null && row.providerStatus === "accepted")
      acceptedUnverified += row.count;
    else if (row.verified === false) verificationMismatch += row.count;
  }
  return {
    available: true as const,
    proposals,
    executedVerified,
    acceptedUnverified,
    verificationMismatch,
    uncertain,
  };
}

function wholeNumber(value: string | null, fallback: number) {
  if (value == null || value.trim() === "") return fallback;
  if (!/^\d+$/.test(value)) return null;
  return Number(value);
}

function optionalLabel(value: string | null, max: number) {
  const label = value?.trim() ?? "";
  if (!label) return null;
  if (!/^[A-Za-z0-9._:/-]+$/.test(label) || label.length > max)
    return "invalid" as const;
  return label;
}

function dateWindow(
  range: UsageRange,
  fromRaw: string | null,
  toRaw: string | null,
  now: Date,
): { ok: true; from: Date; to: Date } | { ok: false; error: string } {
  if (range === "24h")
    return {
      ok: true,
      from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      to: now,
    };
  if (range === "7d")
    return {
      ok: true,
      from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: now,
    };
  if (range === "30d")
    return {
      ok: true,
      from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: now,
    };
  const from = fromRaw ? new Date(fromRaw) : null;
  const to = toRaw ? new Date(toRaw) : null;
  if (
    !from ||
    !to ||
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    from >= to
  ) {
    return { ok: false, error: "Enter a valid custom date range." };
  }
  if (to.getTime() - from.getTime() > MAX_RANGE_MS) {
    return { ok: false, error: "Custom ranges are limited to 90 days." };
  }
  if (to.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
    return { ok: false, error: "The end date is too far in the future." };
  }
  return { ok: true, from, to };
}
