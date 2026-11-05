import type {
  AgentToolCall,
  ReadOnlyAgentTool,
} from "@/lib/beyond-master/tools/types";

export const ACCOUNT_READ_TOOLS: ReadOnlyAgentTool[] = [
  "get_my_domains",
  "get_my_hosting",
  "get_my_invoices",
  "get_my_orders",
  "get_my_tickets",
];

export function toolsCoverAccountReads(calls: AgentToolCall[]): boolean {
  return calls.some((call) => ACCOUNT_READ_TOOLS.includes(call.tool));
}
