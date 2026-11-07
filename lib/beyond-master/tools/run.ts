import { recordBeyondMasterUsage } from "@/lib/beyond-master/usage";
import { allowBeyondMasterTools } from "@/lib/beyond-master/rate-limit";
import {
  canExecuteReadOnlyTool,
  principalFromSession,
} from "@/lib/beyond-master/authorization";
import {
  type AgentToolContext,
  logAgentToolOutcome,
} from "@/lib/beyond-master/tools/context";
import {
  cardsFromToolResult,
  domainSuggestionsFromResults,
  executeReadOnlyTool,
  toolResultPromptLines,
} from "@/lib/beyond-master/tools/handlers";
import { planReadOnlyToolsForSession } from "@/lib/beyond-master/tools/intent";
import type {
  AgentToolCall,
  AgentToolResult,
  AgentToolRunSummary,
} from "@/lib/beyond-master/tools/types";

export async function runReadOnlyAgentTools(input: {
  message: string;
  ctx: AgentToolContext;
}): Promise<AgentToolRunSummary> {
  const principal =
    input.ctx.chatPrincipal ??
    principalFromSession({
      customerUserId: input.ctx.customerUserId,
      orbitAdmin: null,
    });
  const calls = planReadOnlyToolsForSession({
    message: input.message,
    customerUserId: input.ctx.customerUserId,
  }).filter((call) => canExecuteReadOnlyTool(principal, call.tool));
  if (calls.length === 0) {
    return {
      calls: [],
      results: [],
      promptBlock: "",
      domainResults: [],
      accountCards: [],
      dnsRecords: null,
    };
  }
  if (
    input.ctx.customerUserId &&
    !(await allowBeyondMasterTools(input.ctx.customerUserId))
  ) {
    return {
      calls,
      results: calls.map((call) => ({
        ok: false,
        tool: call.tool,
        code: "rate_limited",
        error: "Too many account lookups. Please try again shortly.",
      })),
      promptBlock:
        "Tool rate limit reached for this account. Do not invent private records.",
      domainResults: [],
      accountCards: [],
      dnsRecords: null,
    };
  }

  const results: AgentToolResult[] = [];
  for (const call of calls) {
    const result = await executeReadOnlyTool(input.ctx, call);
    logAgentToolOutcome(input.ctx, result);
    results.push(result);
    if (result.ok) {
      await recordBeyondMasterUsage({
        provider: "agent_tool",
        model: result.tool,
        status: "success",
        customerUserId: input.ctx.customerUserId,
        ip: input.ctx.ip,
      });
    }
  }

  const lines: string[] = [
    "Verified server tool results for this turn (read-only). Explain naturally in the customer's language. Never claim write actions completed.",
  ];
  for (const result of results) {
    lines.push(`--- ${result.tool} ---`, ...toolResultPromptLines(result));
  }

  const accountCards = (
    await Promise.all(results.map((row) => cardsFromToolResult(input.ctx, row)))
  ).flat();

  let dnsRecords: AgentToolRunSummary["dnsRecords"] = null;
  for (const result of results) {
    if (result.ok && result.tool === "get_dns_records") {
      const data = result.data as {
        domain: string;
        records: { type: string; host: string; value: string; ttl: number }[];
      };
      dnsRecords = { domain: data.domain, records: data.records };
    }
  }

  return {
    calls,
    results,
    promptBlock: lines.join("\n"),
    domainResults: domainSuggestionsFromResults(results),
    accountCards,
    dnsRecords,
  };
}

export type { AgentToolCall, AgentToolResult };
