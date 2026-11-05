import type {
  ReadOnlyAgentTool,
  AgentToolResult,
} from "@/lib/beyond-master/tools/types";

export type AgentToolContext = {
  customerUserId: string | null;
  ip: string;
};

export function logAgentToolOutcome(
  ctx: AgentToolContext,
  result: AgentToolResult,
): void {
  const base = {
    customerUserId: ctx.customerUserId ? hashId(ctx.customerUserId) : null,
    tool: result.tool,
    ok: result.ok,
    code: result.ok ? "success" : result.code,
  };
  if (process.env.NODE_ENV !== "production") {
    console.info("[beyond-master-tool]", base);
  }
}

function hashId(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return `u${Math.abs(hash)}`;
}

export function signInRequiredResult(tool: ReadOnlyAgentTool): AgentToolResult {
  return {
    ok: false,
    tool,
    code: "sign_in_required",
    error:
      "Sign in to view private account records. Guest chats cannot access another customer's data.",
    signInRequired: true,
  };
}
