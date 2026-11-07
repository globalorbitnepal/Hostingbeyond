import {
  detectGroundedTopic,
  type GroundedReply,
} from "@/lib/beyond-master/grounded";
import {
  type AgentToolCall,
  type AgentToolResult,
  isGuestAllowedReadOnlyTool,
} from "@/lib/beyond-master/tools/types";

/**
 * When Gemini is configured, guests still get deterministic answers if tools or
 * grounded copy fully address the message — avoids spending quota on public FAQ.
 */
export function shouldSkipGeminiForGuest(input: {
  lastMessage: string;
  toolCalls: AgentToolCall[];
  toolResults: AgentToolResult[];
  domainResultCount: number;
  hasCommerceProposal: boolean;
  hasCommerceNotice: boolean;
  grounded: GroundedReply;
}): boolean {
  if (input.hasCommerceProposal || input.hasCommerceNotice) {
    return false;
  }
  if (
    input.toolCalls.length > 0 &&
    input.toolCalls.every((c) => isGuestAllowedReadOnlyTool(c.tool)) &&
    input.toolResults.some((row) => row.ok)
  ) {
    return true;
  }
  const topic = detectGroundedTopic(input.lastMessage);
  if (topic && input.toolCalls.length === 0) {
    return true;
  }
  if (
    input.toolCalls.length === 0 &&
    input.grounded.domains.length > 0 &&
    input.lastMessage.trim().length > 0
  ) {
    return true;
  }
  return false;
}

/** Authenticated paths: FAQ / topic copy without tools skips provider when safe. */
export function shouldSkipGeminiForAuthenticatedTopic(input: {
  lastMessage: string;
  toolCalls: AgentToolCall[];
  hasCommerceProposal: boolean;
  hasCommerceNotice: boolean;
  hasDnsPrompt: boolean;
  accountPromptUsed: boolean;
}): boolean {
  if (
    input.hasCommerceProposal ||
    input.hasCommerceNotice ||
    input.hasDnsPrompt ||
    input.accountPromptUsed
  ) {
    return false;
  }
  if (input.toolCalls.length > 0) return false;
  return Boolean(detectGroundedTopic(input.lastMessage));
}
