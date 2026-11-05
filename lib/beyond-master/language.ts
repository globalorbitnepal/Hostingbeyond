/** Language detection for customer messages. No network, no guessing about content. */

import type { BeyondMasterChatTurn } from "@/lib/beyond-master/request";

export type AgentLanguage = "en" | "hi" | "ne";

/**
 * Distinctive Devanagari markers. Scoring both sides matters because Hindi and
 * Nepali share a script, and a single shared word (मूल्य, प्लान) proves nothing.
 */
const NEPALI_MARKERS = [
  "होस्टिङ",
  "डोमेनको",
  "हुन्छ",
  "हुन्छन्",
  "गर्नु",
  "गर्ने",
  "गर्न",
  "गर्छ",
  "गर्छु",
  "कसरी",
  "किन",
  "लागि",
  "बाट",
  "पनि",
  "तपाईं",
  "हुन्",
  "छ",
  "छन्",
  "कति",
  "देखि",
  "गरी",
  "सकिन्छ",
  "चाहिन्छ",
  "राख्न",
  "भयो",
  "हेर्ने",
  "किन्ने",
  "बुझ्ने",
  "पाउने",
  "दिनुहोस्",
];

const HINDI_MARKERS = [
  "होस्टिंग",
  "कीमत",
  "दाम",
  "क्या",
  "कैसे",
  "क्यों",
  "कहां",
  "मुझे",
  "आप",
  "चाहिए",
  "चाहता",
  "चाहती",
  "करना",
  "करें",
  "बताओ",
  "बताइए",
  "होगा",
  "है",
  "हैं",
  "की",
  "का",
  "के",
  "में",
  "देखूँ",
  "देखूं",
  "मिलेगा",
  "करूँ",
];

const NEPALI_ROMAN =
  /\b(kasari|kati|chahincha|chahinchha|bhanne|bhaneko|garna|garnu|malai|tapai|huncha|hola|bhayo|ramro|paisa|rakhna|sakchha|hunchha|gardai|mero|connect nahi)\b/i;
const HINDI_ROMAN =
  /\b(kaise|kya|kyu|kyun|kahan|kitna|kitne|chahiye|chaiye|batao|bataiye|karo|karna|kare|hai|hain|mujhe|mera|meri|aap|nahi|nahin|kaisa|kripya|mulya|daam|paisa|plz|please help|register karna|open nahi|website ke liye)\b/i;

function score(text: string, markers: readonly string[]): number {
  let total = 0;
  for (const marker of markers) {
    if (text.includes(marker)) total += 1;
  }
  return total;
}

function isMeaningfulUserMessage(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  return !/^[\p{Emoji}\s]+$/u.test(trimmed);
}

export function detectAgentLanguage(message: string): AgentLanguage {
  const text = message.trim();
  if (!text) return "en";
  if (/[\u0600-\u06FF]/.test(text)) return "en";
  if (/[\u0900-\u097F]/.test(text)) {
    const nepali = score(text, NEPALI_MARKERS);
    const hindi = score(text, HINDI_MARKERS);
    if (nepali > hindi) return "ne";
    return "hi";
  }
  if (NEPALI_ROMAN.test(text)) return "ne";
  if (HINDI_ROMAN.test(text)) return "hi";
  return "en";
}

/**
 * Conversation language follows the latest customer message, falling back to the
 * first meaningful user turn so context survives language switches.
 */
export function resolveConversationLanguage(
  messages: BeyondMasterChatTurn[],
): AgentLanguage {
  let first: AgentLanguage | null = null;
  let latest: AgentLanguage | null = null;
  for (const turn of messages) {
    if (turn.role !== "user") continue;
    if (!isMeaningfulUserMessage(turn.content)) continue;
    const lang = detectAgentLanguage(turn.content);
    if (!first) first = lang;
    latest = lang;
  }
  return latest ?? first ?? "en";
}

export function conversationLanguagePromptBlock(
  messages: BeyondMasterChatTurn[],
): string {
  const locale = resolveConversationLanguage(messages);
  const lines = [
    "Conversation language:",
    "- Reply in the same language and script the customer uses in their latest message.",
    "- English, Hindi, Hinglish (Hindi in Latin letters), Nepali, Urdu, Bengali, Arabic, Spanish, French, German, Chinese, Japanese, Portuguese, and Russian are all supported without asking the customer to pick a language.",
    "- If the customer switches language, follow the switch and keep prior context.",
    "- Keep domain names, email addresses, DNS hostnames, and prices exactly as written.",
  ];
  if (locale === "hi") {
    lines.push(
      "- The customer is using Hindi or Hinglish. Answer naturally in that style.",
    );
  } else if (locale === "ne") {
    lines.push("- The customer is using Nepali. Answer naturally in Nepali.");
  }
  return lines.join("\n");
}

export function agentLanguageLabel(language: AgentLanguage): string {
  if (language === "hi") return "Hindi/Hinglish";
  if (language === "ne") return "Nepali";
  return "English";
}
