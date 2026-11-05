/** Language detection for customer messages. Re-exports BCP-47 locale helpers. */

export {
  type AgentLanguage,
  type ConversationLocale,
  type SupportedPrimary,
  agentLanguageLabel,
  conversationLanguagePromptBlock,
  detectAgentLanguage,
  detectMessageLocale,
  normalizeBcp47Locale,
  primaryLanguageSubtag,
  resolveConversationLocale,
} from "@/lib/beyond-master/locale";

import type { BeyondMasterChatTurn } from "@/lib/beyond-master/request";
import { resolveConversationLocale as resolveLocale } from "@/lib/beyond-master/locale";

/** @deprecated Use resolveConversationLocale */
export function resolveConversationLanguage(
  messages: BeyondMasterChatTurn[],
): import("@/lib/beyond-master/locale").AgentLanguage {
  const locale = resolveLocale(messages);
  const primary = locale.split("-")[0];
  if (primary === "hi" || primary === "ne") return primary;
  return "en";
}
