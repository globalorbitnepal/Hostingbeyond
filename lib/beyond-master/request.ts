import { BEYOND_MASTER_MAX_MESSAGE_LENGTH } from "@/lib/beyond-master/copy";
import { normalizeBcp47Locale } from "@/lib/beyond-master/locale";

export type BeyondMasterChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const MAX_TURNS = 16;
const MAX_TOTAL_CHARS = 24_000;

/** Recent turns sent to the language model (full thread may be longer client-side). */
export const BEYOND_MASTER_PROVIDER_CONTEXT_TURNS = 12;

export function trimBeyondMasterProviderContext(
  messages: BeyondMasterChatTurn[],
  maxTurns = BEYOND_MASTER_PROVIDER_CONTEXT_TURNS,
): BeyondMasterChatTurn[] {
  if (messages.length <= maxTurns) return messages;
  return messages.slice(-maxTurns);
}

export function parseBeyondMasterChatRequest(raw: unknown):
  | {
      ok: true;
      messages: BeyondMasterChatTurn[];
      model: string | null;
      preferredLocale: string | null;
    }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Send a JSON object with a messages array." };
  }
  const record = raw as Record<string, unknown>;
  if ("customerId" in record || "userId" in record || "apiKey" in record) {
    return { ok: false, error: "That field is not accepted." };
  }
  if (!Array.isArray(record.messages)) {
    return { ok: false, error: "Send a JSON object with a messages array." };
  }
  if (record.messages.length < 1 || record.messages.length > MAX_TURNS) {
    return { ok: false, error: `Send between 1 and ${MAX_TURNS} messages.` };
  }
  const messages: BeyondMasterChatTurn[] = [];
  let total = 0;
  for (const entry of record.messages) {
    if (!entry || typeof entry !== "object") {
      return { ok: false, error: "Each message needs a role and content." };
    }
    const role = (entry as { role?: unknown }).role;
    const content = (entry as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") {
      return {
        ok: false,
        error: "Only user and assistant messages are accepted.",
      };
    }
    if (typeof content !== "string") {
      return { ok: false, error: "Each message needs text content." };
    }
    const body = content.replace(/\u0000/g, "").trim();
    if (!body || body.length > BEYOND_MASTER_MAX_MESSAGE_LENGTH) {
      return {
        ok: false,
        error: `Each message must be 1 to ${BEYOND_MASTER_MAX_MESSAGE_LENGTH} characters.`,
      };
    }
    total += body.length;
    if (total > MAX_TOTAL_CHARS) {
      return { ok: false, error: "This conversation is too long to send." };
    }
    messages.push({ role, content: body });
  }
  if (messages[messages.length - 1]?.role !== "user") {
    return {
      ok: false,
      error: "The latest message must be from the customer.",
    };
  }
  let model: string | null = null;
  if ("model" in record) {
    if (typeof record.model !== "string" || !record.model.trim()) {
      return { ok: false, error: "Model must be a non-empty string." };
    }
    const requested = record.model.trim();
    if (!/^[A-Za-z0-9._:/-]{1,80}$/.test(requested)) {
      return { ok: false, error: "That model is not available." };
    }
    model = requested;
  }
  let preferredLocale: string | null = null;
  if ("preferredLocale" in record || "preferredLanguage" in record) {
    const raw =
      typeof record.preferredLocale === "string"
        ? record.preferredLocale
        : typeof record.preferredLanguage === "string"
          ? record.preferredLanguage
          : null;
    preferredLocale = normalizeBcp47Locale(raw);
    if (raw && !preferredLocale) {
      return { ok: false, error: "That locale value is not accepted." };
    }
  }
  return { ok: true, messages, model, preferredLocale };
}
