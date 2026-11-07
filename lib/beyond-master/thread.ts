import {
  BEYOND_MASTER_MAX_CONVERSATIONS,
  BEYOND_MASTER_MAX_MESSAGE_LENGTH,
  BEYOND_MASTER_PROVIDER_NOTICE,
} from "@/lib/beyond-master/copy";
import { normalizeBcp47Locale } from "@/lib/beyond-master/locale";
import type {
  BeyondMasterConversation,
  BeyondMasterMessage,
} from "@/lib/beyond-master/types";

export function createConversation(
  now: string,
  id: string,
): BeyondMasterConversation {
  return {
    id,
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function conversationTitle(body: string): string {
  const line = body.replace(/\s+/g, " ").trim();
  if (line.length <= 48) return line || "New conversation";
  return `${line.slice(0, 45).trimEnd()}…`;
}

export function appendUserMessage(
  conversation: BeyondMasterConversation,
  message: BeyondMasterMessage,
): BeyondMasterConversation {
  const title = conversation.messages.some((item) => item.role === "user")
    ? conversation.title
    : conversationTitle(message.body);
  return {
    ...conversation,
    title,
    updatedAt: message.createdAt,
    messages: [...conversation.messages, message],
  };
}

export function markMessage(
  conversation: BeyondMasterConversation,
  messageId: string,
  status: BeyondMasterMessage["status"],
  updatedAt: string,
): BeyondMasterConversation {
  return {
    ...conversation,
    updatedAt,
    messages: conversation.messages.map((message) =>
      message.id === messageId ? { ...message, status } : message,
    ),
  };
}

export function dropMessage(
  conversation: BeyondMasterConversation,
  messageId: string,
): BeyondMasterConversation {
  return {
    ...conversation,
    messages: conversation.messages.filter(
      (message) => message.id !== messageId,
    ),
  };
}

export function updateMessage(
  conversation: BeyondMasterConversation,
  messageId: string,
  patch: Partial<Pick<BeyondMasterMessage, "body" | "status">>,
  updatedAt: string,
): BeyondMasterConversation {
  return {
    ...conversation,
    updatedAt,
    messages: conversation.messages.map((message) =>
      message.id === messageId ? { ...message, ...patch } : message,
    ),
  };
}

export function dropFromMessage(
  conversation: BeyondMasterConversation,
  messageId: string,
): BeyondMasterConversation {
  const index = conversation.messages.findIndex(
    (message) => message.id === messageId,
  );
  if (index < 0) return conversation;
  return { ...conversation, messages: conversation.messages.slice(0, index) };
}

export function chatContext(messages: BeyondMasterMessage[]) {
  return messages.flatMap((message) => {
    if (message.role !== "user" && message.role !== "assistant") return [];
    if (message.status === "failed") return [];
    const content = message.body.trim();
    if (!content) return [];
    return [{ role: message.role, content }];
  });
}

export function appendProviderNotice(
  conversation: BeyondMasterConversation,
  message: BeyondMasterMessage,
): BeyondMasterConversation {
  return {
    ...conversation,
    updatedAt: message.createdAt,
    messages: [...conversation.messages, message],
  };
}

export function validateDraft(
  draft: string,
): { ok: true; body: string } | { ok: false; error: string } {
  const body = draft.trim();
  if (!body) return { ok: false, error: "Write a message first." };
  if (body.length > BEYOND_MASTER_MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Keep the message under ${BEYOND_MASTER_MAX_MESSAGE_LENGTH} characters.`,
    };
  }
  return { ok: true, body };
}

export function upsertConversation(
  conversations: BeyondMasterConversation[],
  next: BeyondMasterConversation,
): BeyondMasterConversation[] {
  const rest = conversations.filter((item) => item.id !== next.id);
  return [next, ...rest].slice(0, BEYOND_MASTER_MAX_CONVERSATIONS);
}

export function parseStoredConversations(
  raw: string,
): BeyondMasterConversation[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const conversations = (parsed as { conversations?: unknown }).conversations;
  if (!Array.isArray(conversations)) return null;
  const safe: BeyondMasterConversation[] = [];
  for (const item of conversations) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<BeyondMasterConversation>;
    if (typeof row.id !== "string" || typeof row.title !== "string") continue;
    if (typeof row.createdAt !== "string" || typeof row.updatedAt !== "string")
      continue;
    if (!Array.isArray(row.messages)) continue;
    const messages: BeyondMasterMessage[] = [];
    for (const message of row.messages) {
      if (!message || typeof message !== "object") continue;
      const entry = message as Partial<BeyondMasterMessage>;
      if (typeof entry.id !== "string" || typeof entry.body !== "string")
        continue;
      if (
        entry.role !== "user" &&
        entry.role !== "assistant" &&
        entry.role !== "notice"
      ) {
        continue;
      }
      if (
        entry.status !== "pending" &&
        entry.status !== "sent" &&
        entry.status !== "failed"
      ) {
        continue;
      }
      if (typeof entry.createdAt !== "string") continue;
      if (
        entry.role === "notice" &&
        entry.body !== BEYOND_MASTER_PROVIDER_NOTICE
      )
        continue;
      messages.push({
        id: entry.id,
        role: entry.role,
        body: entry.body.slice(
          0,
          entry.role === "assistant"
            ? 16_000
            : BEYOND_MASTER_MAX_MESSAGE_LENGTH,
        ),
        createdAt: entry.createdAt,
        status: entry.status === "pending" ? "failed" : entry.status,
        code: entry.role === "notice" ? "provider_not_configured" : undefined,
      });
    }
    const guestTok =
      typeof row.guestCapabilityToken === "string" &&
      row.guestCapabilityToken.length >= 32
        ? row.guestCapabilityToken
        : undefined;
    safe.push({
      id: row.id,
      title: row.title.slice(0, 80),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      preferredLanguage:
        normalizeBcp47Locale(row.preferredLanguage) ?? undefined,
      ...(guestTok ? { guestCapabilityToken: guestTok } : {}),
      messages,
    });
  }
  return safe.slice(0, BEYOND_MASTER_MAX_CONVERSATIONS);
}
