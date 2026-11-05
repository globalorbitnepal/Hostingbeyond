import {
  readAgentHostingPlans,
  readAgentTldPrices,
} from "@/lib/beyond-master/catalog-read";
import { prismaAccountReader } from "@/lib/beyond-master/account/prisma-reader";
import {
  domainCards,
  hostingCards,
  invoiceCards,
} from "@/lib/beyond-master/account/read";
import { beyondMasterDnsRuntime } from "@/lib/beyond-master/dns/http";
import {
  formatDomainSearchForPrompt,
  searchDomainsForAgent,
  type AgentDomainSuggestion,
} from "@/lib/beyond-master/domain-search";
import { listCustomerDomainOrders } from "@/lib/domains/customer-domain-orders";
import {
  getCustomerHostingOrderByReference,
  listCustomerHostingOrderSummaries,
} from "@/lib/hosting/customer-hosting-orders";
import { getBeyondMasterTicketRepository } from "@/lib/beyond-master/tickets/repository";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { splitDomain } from "@/lib/domains/tlds";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import type { AccountCard } from "@/lib/beyond-master/account/types";
import {
  type AgentToolContext,
  signInRequiredResult,
} from "@/lib/beyond-master/tools/context";
import type {
  AgentToolCall,
  AgentToolResult,
  ReadOnlyAgentTool,
} from "@/lib/beyond-master/tools/types";

let accountReaderOverride: typeof prismaAccountReader | null = null;
let ticketRepoOverride: ReturnType<
  typeof getBeyondMasterTicketRepository
> | null = null;

export function setBeyondMasterToolReadersForTests(input: {
  account?: typeof prismaAccountReader | null;
  tickets?: ReturnType<typeof getBeyondMasterTicketRepository> | null;
}) {
  if (process.env.NODE_ENV === "production") return;
  if ("account" in input) accountReaderOverride = input.account ?? null;
  if ("tickets" in input) ticketRepoOverride = input.tickets ?? null;
}

function accountReader() {
  if (process.env.NODE_ENV !== "production" && accountReaderOverride) {
    return accountReaderOverride;
  }
  return prismaAccountReader;
}

function ticketRepo() {
  if (process.env.NODE_ENV !== "production" && ticketRepoOverride) {
    return ticketRepoOverride;
  }
  return getBeyondMasterTicketRepository();
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function validateDomain(domain: string): string | null {
  const normalized = domain.toLowerCase().trim();
  if (
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9-]{2,24})+$/.test(
      normalized,
    )
  ) {
    return null;
  }
  return normalized;
}

async function runSearchDomain(
  args: Record<string, unknown>,
): Promise<AgentToolResult> {
  const query = asString(args.query);
  if (!query) {
    return {
      ok: false,
      tool: "search_domain",
      code: "invalid_args",
      error: "A domain name or keyword is required for search.",
    };
  }
  const search = await searchDomainsForAgent(query);
  return { ok: true, tool: "search_domain", data: search };
}

async function runCheckAvailability(
  args: Record<string, unknown>,
): Promise<AgentToolResult> {
  const domainRaw = asString(args.domain);
  if (!domainRaw) {
    return {
      ok: false,
      tool: "check_domain_availability",
      code: "invalid_args",
      error: "A full domain name is required (for example example.com).",
    };
  }
  const domain = validateDomain(domainRaw);
  if (!domain) {
    return {
      ok: false,
      tool: "check_domain_availability",
      code: "invalid_args",
      error: "That domain name is not valid.",
    };
  }
  try {
    const tld = splitDomain(domain).tld || ".com";
    const { results } = await lookupDomainNames(
      [domain],
      { query: domain, tlds: [tld] },
      { fresh: true },
    );
    const row =
      results.find((item) => item.domain.toLowerCase() === domain) ??
      results[0];
    if (!row) {
      return {
        ok: false,
        tool: "check_domain_availability",
        code: "lookup_empty",
        error:
          "The registrar returned no availability row. Do not guess availability.",
      };
    }
    return {
      ok: true,
      tool: "check_domain_availability",
      data: {
        domain: row.domain,
        status: row.status,
        register: row.register,
        currency: "USD",
      },
    };
  } catch {
    return {
      ok: false,
      tool: "check_domain_availability",
      code: "lookup_failed",
      error: "Live availability could not be checked right now.",
    };
  }
}

async function runDomainPricing(
  args: Record<string, unknown>,
): Promise<AgentToolResult> {
  const tldsRaw = args.tlds;
  const tlds: string[] = Array.isArray(tldsRaw)
    ? tldsRaw.flatMap((item) => {
        const value = asString(item);
        return value ? [value] : [];
      })
    : asString(tldsRaw)
      ? [asString(tldsRaw)!]
      : [];
  if (tlds.length === 0) {
    const normalized = normalizeDomainSearchInput(asString(args.query) ?? "");
    if (normalized.ok && normalized.tld) {
      tlds.push(normalized.tld);
    }
  }
  if (tlds.length === 0) {
    return {
      ok: false,
      tool: "get_domain_pricing",
      code: "invalid_args",
      error: "Name a TLD such as .com or a domain to read catalog pricing.",
    };
  }
  const prices = await readAgentTldPrices(tlds);
  if (prices.length === 0) {
    return {
      ok: false,
      tool: "get_domain_pricing",
      code: "catalog_empty",
      error: "No enabled TLD prices were found in the catalog.",
    };
  }
  return { ok: true, tool: "get_domain_pricing", data: { prices } };
}

async function runMyDomains(
  ctx: AgentToolContext,
  args: Record<string, unknown>,
): Promise<AgentToolResult> {
  if (!ctx.customerUserId) return signInRequiredResult("get_my_domains");
  const reader = accountReader();
  const filter = asString(args.domain);
  const rows = await reader.domains(ctx.customerUserId, 0, filter ? 50 : 5);
  const filtered = filter
    ? rows.filter((row) => row.name.toLowerCase() === filter.toLowerCase())
    : rows;
  return { ok: true, tool: "get_my_domains", data: { domains: filtered } };
}

async function runMyHosting(ctx: AgentToolContext): Promise<AgentToolResult> {
  if (!ctx.customerUserId) return signInRequiredResult("get_my_hosting");
  const rows = await accountReader().hosting(ctx.customerUserId, 0, 5);
  return { ok: true, tool: "get_my_hosting", data: { hosting: rows } };
}

async function runMyInvoices(ctx: AgentToolContext): Promise<AgentToolResult> {
  if (!ctx.customerUserId) return signInRequiredResult("get_my_invoices");
  const rows = await accountReader().invoices(ctx.customerUserId, 0, 5);
  return { ok: true, tool: "get_my_invoices", data: { invoices: rows } };
}

async function runMyOrders(ctx: AgentToolContext): Promise<AgentToolResult> {
  if (!ctx.customerUserId) return signInRequiredResult("get_my_orders");
  const domainOrders = await listCustomerDomainOrders(ctx.customerUserId, 10);
  const hostingOrders = await listCustomerHostingOrderSummaries(
    ctx.customerUserId,
  );
  return {
    ok: true,
    tool: "get_my_orders",
    data: { domainOrders, hostingOrders },
  };
}

async function runHostingOrderStatus(
  ctx: AgentToolContext,
  args: Record<string, unknown>,
): Promise<AgentToolResult> {
  if (!ctx.customerUserId) {
    return signInRequiredResult("get_hosting_order_status");
  }
  const orderReference = asString(args.orderReference);
  if (!orderReference) {
    return {
      ok: false,
      tool: "get_hosting_order_status",
      code: "invalid_args",
      error:
        "A hosting order reference is required (for example HST-AB12CD34EF).",
    };
  }
  const order = await getCustomerHostingOrderByReference(
    ctx.customerUserId,
    orderReference,
  );
  if (!order) {
    return {
      ok: false,
      tool: "get_hosting_order_status",
      code: "not_found",
      error: "No hosting order with that reference was found on your account.",
    };
  }
  return {
    ok: true,
    tool: "get_hosting_order_status",
    data: { order },
  };
}

async function runMyTickets(ctx: AgentToolContext): Promise<AgentToolResult> {
  if (!ctx.customerUserId) return signInRequiredResult("get_my_tickets");
  try {
    const tickets = await ticketRepo().listForCustomer({
      customerUserId: ctx.customerUserId,
      status: null,
      query: "",
    });
    return {
      ok: true,
      tool: "get_my_tickets",
      data: {
        tickets: tickets.map((row) => ({
          reference: row.reference,
          subject: row.subject,
          status: row.status,
          priority: row.priority,
          updatedAt: row.updatedAt,
          domainName: row.domainName,
        })),
      },
    };
  } catch {
    return {
      ok: false,
      tool: "get_my_tickets",
      code: "tickets_unavailable",
      error: "Support tickets could not be loaded right now.",
    };
  }
}

async function runDnsRecords(
  ctx: AgentToolContext,
  args: Record<string, unknown>,
): Promise<AgentToolResult> {
  if (!ctx.customerUserId) return signInRequiredResult("get_dns_records");
  const domain = validateDomain(asString(args.domain) ?? "");
  if (!domain) {
    return {
      ok: false,
      tool: "get_dns_records",
      code: "invalid_args",
      error: "Name the domain to list DNS records (for example example.com).",
    };
  }
  const runtime = beyondMasterDnsRuntime();
  const owned = await runtime.ports.own(ctx.customerUserId, domain);
  if (!owned.ok) {
    return {
      ok: false,
      tool: "get_dns_records",
      code: owned.status === 404 ? "not_found" : "forbidden",
      error: owned.error,
    };
  }
  const listed = await runtime.ports.list(ctx.customerUserId, domain);
  if (!listed.ok) {
    return {
      ok: false,
      tool: "get_dns_records",
      code: "list_failed",
      error: listed.error,
    };
  }
  return {
    ok: true,
    tool: "get_dns_records",
    data: { domain, records: listed.records },
  };
}

async function runHostingPlans(): Promise<AgentToolResult> {
  const plans = await readAgentHostingPlans();
  if (plans.length === 0) {
    return {
      ok: false,
      tool: "get_hosting_plans",
      code: "catalog_empty",
      error: "Live hosting plans could not be read from the catalog.",
    };
  }
  return { ok: true, tool: "get_hosting_plans", data: { plans } };
}

export async function executeReadOnlyTool(
  ctx: AgentToolContext,
  call: AgentToolCall,
): Promise<AgentToolResult> {
  switch (call.tool) {
    case "search_domain":
      return runSearchDomain(call.args);
    case "check_domain_availability":
      return runCheckAvailability(call.args);
    case "get_domain_pricing":
      return runDomainPricing(call.args);
    case "get_my_domains":
      return runMyDomains(ctx, call.args);
    case "get_my_hosting":
      return runMyHosting(ctx);
    case "get_my_invoices":
      return runMyInvoices(ctx);
    case "get_my_orders":
      return runMyOrders(ctx);
    case "get_hosting_order_status":
      return runHostingOrderStatus(ctx, call.args);
    case "get_my_tickets":
      return runMyTickets(ctx);
    case "get_dns_records":
      return runDnsRecords(ctx, call.args);
    case "get_hosting_plans":
      return runHostingPlans();
    default: {
      const tool = call.tool as ReadOnlyAgentTool;
      return {
        ok: false,
        tool,
        code: "unsupported",
        error: "That action is not available.",
      };
    }
  }
}

export function toolResultPromptLines(result: AgentToolResult): string[] {
  if (!result.ok) {
    return [
      `Tool ${result.tool} failed (${result.code}): ${result.error}`,
      "Do not invent data to replace this failure.",
    ];
  }
  switch (result.tool) {
    case "search_domain": {
      const search = result.data as Awaited<
        ReturnType<typeof searchDomainsForAgent>
      >;
      return [formatDomainSearchForPrompt(search)];
    }
    case "check_domain_availability": {
      const row = result.data as {
        domain: string;
        status: string;
        register: number | null;
        currency: string;
      };
      const price =
        row.register != null
          ? `${row.register.toFixed(2)} ${row.currency}/yr register`
          : "price on domain search page";
      return [
        `Live availability for ${row.domain}: ${row.status}. ${price}. Do not claim checkout completed.`,
      ];
    }
    case "get_domain_pricing": {
      const data = result.data as {
        prices: Awaited<ReturnType<typeof readAgentTldPrices>>;
      };
      return data.prices.map(
        (price) =>
          `${price.tld} register ${price.register} ${price.currency}, renew ${price.renew}, transfer ${price.transfer}`,
      );
    }
    case "get_my_domains": {
      const data = result.data as {
        domains: { name: string; status: string; expiresAt: string | null }[];
      };
      if (data.domains.length === 0)
        return ["No matching domains on this signed-in account."];
      return data.domains.map(
        (row) =>
          `${row.name} status ${row.status} expires ${row.expiresAt ?? "n/a"}`,
      );
    }
    case "get_my_hosting": {
      const data = result.data as {
        hosting: {
          productName: string | null;
          planName: string | null;
          status: string;
        }[];
      };
      if (data.hosting.length === 0)
        return ["No hosting orders on this account."];
      return data.hosting.map((row) =>
        `${row.productName ?? "Hosting"} ${row.planName ?? ""} status ${row.status}`.trim(),
      );
    }
    case "get_my_invoices": {
      const data = result.data as {
        invoices: {
          number: string;
          amount: string;
          currency: string;
          status: string;
        }[];
      };
      if (data.invoices.length === 0) return ["No invoices on this account."];
      return data.invoices.map(
        (row) => `${row.number} ${row.amount} ${row.currency} ${row.status}`,
      );
    }
    case "get_my_orders": {
      const data = result.data as {
        domainOrders: Awaited<ReturnType<typeof listCustomerDomainOrders>>;
        hostingOrders: {
          orderReference: string;
          productSlug: string;
          planKey: string;
          status: string;
          statusLabel: string;
          total: number;
          currency: string;
          isLive: boolean;
          statusMessage: string;
        }[];
      };
      const lines: string[] = [];
      if (data.domainOrders.length === 0) lines.push("No domain orders.");
      else {
        lines.push(
          ...data.domainOrders.map(
            (row) =>
              `domain ${row.publicId} ${row.domain} ${row.orderType} ${row.status} ${row.total} ${row.currency}`,
          ),
        );
      }
      if (data.hostingOrders.length === 0) lines.push("No hosting orders.");
      else {
        lines.push(
          ...data.hostingOrders.map(
            (row) =>
              `hosting ${row.orderReference} ${row.productSlug}/${row.planKey} ${row.status} (${row.statusLabel}) live=${row.isLive} — ${row.statusMessage} ${row.total} ${row.currency}`,
          ),
        );
      }
      return lines;
    }
    case "get_hosting_order_status": {
      const data = result.data as {
        order: {
          orderReference: string;
          status: string;
          statusLabel: string;
          isLive: boolean;
          statusMessage: string;
        };
      };
      const row = data.order;
      return [
        `Hosting order ${row.orderReference}: ${row.status} (${row.statusLabel}). Live=${row.isLive}. ${row.statusMessage}`,
      ];
    }
    case "get_my_tickets": {
      const data = result.data as {
        tickets: { reference: string; subject: string; status: string }[];
      };
      if (data.tickets.length === 0)
        return ["No support tickets on this account."];
      return data.tickets.map(
        (row) => `${row.reference} ${row.status} ${row.subject}`,
      );
    }
    case "get_dns_records": {
      const data = result.data as {
        domain: string;
        records: { type: string; host: string; value: string; ttl: number }[];
      };
      return [
        `Registrar DNS for ${data.domain} (${data.records.length} rows). Quote only these values:`,
        ...data.records.map(
          (row) => `${row.type} ${row.host} ${row.value} ttl ${row.ttl}`,
        ),
      ];
    }
    case "get_hosting_plans": {
      const data = result.data as {
        plans: Awaited<ReturnType<typeof readAgentHostingPlans>>;
      };
      return data.plans
        .slice(0, 8)
        .map(
          (plan) =>
            `${plan.product} ${plan.planName}: ${plan.monthly} ${plan.currency}/mo, ${plan.yearly}/yr ${plan.path}`,
        );
    }
    default:
      return [`Tool ${result.tool} succeeded.`];
  }
}

export async function cardsFromToolResult(
  ctx: AgentToolContext,
  result: AgentToolResult,
): Promise<AccountCard[]> {
  if (!result.ok || !ctx.customerUserId) return [];
  const reader = accountReader();
  switch (result.tool) {
    case "get_my_domains":
      return domainCards(reader, ctx.customerUserId, "", 0);
    case "get_my_hosting":
      return hostingCards(reader, ctx.customerUserId, 0);
    case "get_my_invoices":
      return invoiceCards(reader, ctx.customerUserId, "", 0);
    default:
      return [];
  }
}

export function domainSuggestionsFromResults(
  results: AgentToolResult[],
): AgentDomainSuggestion[] {
  for (const result of results) {
    if (!result.ok) continue;
    if (result.tool === "search_domain") {
      const data = result.data as Awaited<
        ReturnType<typeof searchDomainsForAgent>
      >;
      return data.results;
    }
  }
  return [];
}
