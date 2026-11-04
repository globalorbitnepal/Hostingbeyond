import type { ProviderStreamEvent } from "@/lib/beyond-master/providers/sse";

type ChatOverride = (input: {
  messages: { role: "user" | "assistant"; content: string }[];
  systemPrompt: string;
}) => AsyncGenerator<ProviderStreamEvent>;

let chatOverride: ChatOverride | null = null;

export function setBeyondMasterChatTestOverride(fn: ChatOverride | null) {
  if (process.env.NODE_ENV === "production") return;
  chatOverride = fn;
}

export function getBeyondMasterChatTestOverride() {
  if (process.env.NODE_ENV === "production") return null;
  return chatOverride;
}
