export const READ_ONLY_AGENT_TOOLS = [
  "search_domain",
  "check_domain_availability",
  "get_domain_pricing",
  "get_my_domains",
  "get_my_hosting",
  "get_my_invoices",
  "get_my_orders",
  "get_hosting_order_status",
  "get_my_tickets",
  "get_dns_records",
  "get_hosting_plans",
] as const;

export type ReadOnlyAgentTool = (typeof READ_ONLY_AGENT_TOOLS)[number];

/** Tools that never require sign-in — public catalog and domain lookup only. */
export const GUEST_ALLOWED_READ_ONLY_TOOLS: ReadOnlyAgentTool[] = [
  "search_domain",
  "check_domain_availability",
  "get_domain_pricing",
  "get_hosting_plans",
];

export function isGuestAllowedReadOnlyTool(tool: ReadOnlyAgentTool): boolean {
  return GUEST_ALLOWED_READ_ONLY_TOOLS.includes(tool);
}

export type AgentToolCall = {
  tool: ReadOnlyAgentTool;
  args: Record<string, unknown>;
};

export type AgentToolResult =
  | { ok: true; tool: ReadOnlyAgentTool; data: unknown }
  | {
      ok: false;
      tool: ReadOnlyAgentTool;
      code: string;
      error: string;
      signInRequired?: boolean;
    };

export type AgentToolRunSummary = {
  calls: AgentToolCall[];
  results: AgentToolResult[];
  promptBlock: string;
  domainResults: import("@/lib/beyond-master/domain-search").AgentDomainSuggestion[];
  accountCards: import("@/lib/beyond-master/account/types").AccountCard[];
  dnsRecords: {
    domain: string;
    records: {
      type: string;
      host: string;
      value: string;
      ttl: number;
    }[];
  } | null;
};
