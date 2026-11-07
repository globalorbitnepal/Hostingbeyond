/** BCP-47 locale detection and conversation language resolution (no network). */

import type { BeyondMasterChatTurn } from "@/lib/beyond-master/request";

/** Primary language tags used across prompts, copy fallbacks, and errors. */
export type SupportedPrimary =
  | "en"
  | "hi"
  | "ne"
  | "es"
  | "fr"
  | "de"
  | "ar"
  | "bn"
  | "ur"
  | "zh"
  | "ja"
  | "ko"
  | "ru"
  | "pt"
  | "it"
  | "tr"
  | "id";

export type ConversationLocale = string;

const BCP47_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

export function normalizeBcp47Locale(
  raw: string | null | undefined,
): string | null {
  if (!raw || typeof raw !== "string") return null;
  const tag = raw.trim().replace(/_/g, "-");
  if (!tag || tag.length > 35) return null;
  const normalized = tag.toLowerCase();
  if (!BCP47_RE.test(normalized)) return null;
  return normalized;
}

export function primaryLanguageSubtag(locale: string): SupportedPrimary | "en" {
  const base = locale.toLowerCase().split("-")[0] ?? "en";
  switch (base) {
    case "hi":
    case "ne":
    case "es":
    case "fr":
    case "de":
    case "ar":
    case "bn":
    case "ur":
    case "zh":
    case "ja":
    case "ko":
    case "ru":
    case "pt":
    case "it":
    case "tr":
    case "id":
      return base;
    default:
      return "en";
  }
}

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
  "होइन",
  "होला",
  "भन्ने",
  "गर्नुपर्छ",
  "हुनुपर्छ",
];

/**
 * Multi-character Nepali phrases scored with extra weight. Hindi shares many
 * single-word Devanagari tokens with Nepali (e.g. "के"), so a bare marker count
 * can tie. These phrases only occur in Nepali and break the tie correctly.
 */
const NEPALI_STRONG_MARKERS = [
  "के हो",
  "के छ",
  "हुन्छ?",
  "गर्नुपर्छ",
  "हुनुपर्छ",
  "कसरी किन्ने",
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
  /\b(kasari|kati|chahincha|chahinchha|bhanne|bhaneko|garna|garnu|malai|tapai|huncha|bhayo|ramro|paisa|rakhna|sakchha|hunchha|gardai|mero|connect nahi)\b/i;
const HINDI_ROMAN =
  /\b(kaise|kya|kyu|kyun|kahan|kitna|kitne|chahiye|chaiye|batao|bataiye|karo|karna|kare|hai|hain|mujhe|mera|meri|aap|nahi|nahin|kaisa|kripya|mulya|daam|paisa|plz|register karna|website ke liye|banane|suggest kar|domian|domain suggest)\b/i;

const LATIN_HINTS: Array<{ lang: SupportedPrimary; re: RegExp }> = [
  {
    lang: "es",
    re: /\b(necesito|quiero|correo|dominio|precio|cuánto|cuanto|disponible|empresa|ayuda|hola|gracias|factura|pedido|tienda|para mi)\b/i,
  },
  {
    lang: "fr",
    // "email" and "aide" are deliberately excluded: they are ordinary English
    // words, and matching them made "What is business email?" resolve to French.
    re: /\b(bonjour|merci|domaine|hébergement|hebergement|prix|facture|commande|professionnel|qu'est|besoin|français)\b/i,
  },
  {
    lang: "de",
    re: /\b(hallo|danke|preis|rechnung|bestellung|hilfe|verfügbar|ich brauche|ich möchte|guten tag|geschäftlich|was ist|wie viel|brauche ich)\b/i,
  },
  {
    lang: "pt",
    re: /\b(olá|ola|obrigado|domínio|dominio|hospedagem|preço|preco|fatura|pedido|preciso|quero)\b/i,
  },
  {
    lang: "it",
    re: /\b(ciao|grazie|dominio|prezzo|fattura|ordine|aiuto|ho bisogno|voglio)\b/i,
  },
  {
    lang: "tr",
    re: /\b(merhaba|teşekkür|fiyat|fatura|sipariş|yardım|istiyorum)\b/i,
  },
  {
    lang: "id",
    re: /\b(halo|terima kasih|harga|faktur|pesanan|bantuan|saya butuh|saya ingin)\b/i,
  },
  {
    lang: "ru",
    re: /\b(привет|спасибо|домен|хостинг|цена|счёт|счет|заказ|помощь|нужен|хочу)\b/i,
  },
];

function score(text: string, markers: readonly string[]): number {
  let total = 0;
  for (const marker of markers) {
    if (text.includes(marker)) total += 1;
  }
  return total;
}

/** Strong (script-specific) markers count double to break Hindi/Nepali ties. */
function weightedNepaliScore(text: string): number {
  return score(text, NEPALI_MARKERS) + 2 * score(text, NEPALI_STRONG_MARKERS);
}

function isMeaningfulUserMessage(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  return !/^[\p{Emoji}\s]+$/u.test(trimmed);
}

function detectFromScript(text: string): ConversationLocale | null {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0900-\u097F]/.test(text)) {
    const nepali = weightedNepaliScore(text);
    const hindi = score(text, HINDI_MARKERS);
    if (nepali > hindi) return "ne";
    if (hindi > nepali) return "hi";
    return hindi >= nepali ? "hi" : "ne";
  }
  if (/[\u4E00-\u9FFF]/.test(text)) {
    if (/[\u3040-\u30FF]/.test(text)) return "ja";
    if (/[\uAC00-\uD7AF]/.test(text)) return "ko";
    return "zh";
  }
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  return null;
}

const ENGLISH_LATIN =
  /\b(help|please|find|how|what|when|where|why|the|and|for|my|your|register|check|available|hosting|website|domain|want|need|show|list|buy|price)\b/gi;

function detectLatinLocale(text: string): ConversationLocale {
  if (NEPALI_ROMAN.test(text)) return "ne";
  if (HINDI_ROMAN.test(text)) return "hi-Latn";
  let best: SupportedPrimary = "en";
  let bestScore = 0;
  for (const row of LATIN_HINTS) {
    const hits = text.match(row.re)?.length ?? 0;
    if (hits > bestScore) {
      bestScore = hits;
      best = row.lang;
    }
  }
  const englishScore = text.match(ENGLISH_LATIN)?.length ?? 0;
  // English wins ties: Latin-script foreign markers are generic, so a single
  // coincidental hit must never outrank ordinary English phrasing.
  if (englishScore >= bestScore && englishScore > 0) return "en";
  if (bestScore > 0) return best;
  return "en";
}

/** Detect locale from a single customer message (BCP-47 primary or hi-Latn). */
export function detectMessageLocale(message: string): ConversationLocale {
  const text = message.trim();
  if (!text) return "en";
  const script = detectFromScript(text);
  if (script) return script;
  return detectLatinLocale(text);
}

/** @deprecated Use detectMessageLocale — kept for legacy imports. */
export type AgentLanguage = "en" | "hi" | "ne";

export function detectAgentLanguage(message: string): AgentLanguage {
  const locale = detectMessageLocale(message);
  const primary = primaryLanguageSubtag(locale);
  if (primary === "hi" || primary === "ne") return primary;
  return "en";
}

export function resolveConversationLocale(
  messages: BeyondMasterChatTurn[],
  preferred?: ConversationLocale | null,
): ConversationLocale {
  const stored = normalizeBcp47Locale(preferred ?? undefined);
  let first: ConversationLocale | null = null;
  let latest: ConversationLocale | null = null;
  for (const turn of messages) {
    if (turn.role !== "user") continue;
    if (!isMeaningfulUserMessage(turn.content)) continue;
    const lang = detectMessageLocale(turn.content);
    if (!first) first = lang;
    latest = lang;
  }
  return latest ?? first ?? stored ?? "en";
}

export function conversationLanguagePromptBlock(
  messages: BeyondMasterChatTurn[],
  preferred?: ConversationLocale | null,
): string {
  const locale = resolveConversationLocale(messages, preferred);
  const primary = primaryLanguageSubtag(locale);
  const lines = [
    "Conversation language:",
    `- Detected locale for this thread: ${locale}. Reply in the same language and script the customer uses in their latest message.`,
    "- Support natural multilingual conversation (mixed languages, informal spelling, transliteration) without switching to English unless the customer does.",
    "- Preserve domain names, email addresses, DNS hostnames, IP addresses, and numeric prices exactly as written.",
    "- Do not translate product names, code, or technical record values into another script.",
    "- If the customer asks to use another language, switch immediately and keep that choice until they change again.",
    "- Keep a warm, friendly, customer-service tone. Help with HostingBeyond domain, hosting, email, website, and billing. Do not invent competitor promotions.",
  ];
  if (
    locale === "hi-Latn" ||
    (primary === "hi" && /[A-Za-z]/.test(messages.at(-1)?.content ?? ""))
  ) {
    lines.push(
      "- The customer is using Hindi or Hinglish (Latin script). Match that style.",
    );
  } else if (primary === "hi") {
    lines.push(
      "- The customer is using Hindi (Devanagari). Answer naturally in Hindi.",
    );
  } else if (primary === "ne") {
    lines.push("- The customer is using Nepali. Answer naturally in Nepali.");
  } else if (primary !== "en") {
    lines.push(
      `- The customer is using ${primary}. Answer naturally in that language.`,
    );
  }
  return lines.join("\n");
}

export function agentLanguageLabel(locale: ConversationLocale): string {
  const primary = primaryLanguageSubtag(locale);
  if (locale === "hi-Latn" || primary === "hi") return "Hindi/Hinglish";
  if (primary === "ne") return "Nepali";
  if (primary === "es") return "Spanish";
  if (primary === "fr") return "French";
  if (primary === "ar") return "Arabic";
  if (primary === "bn") return "Bengali";
  if (primary === "de") return "German";
  if (primary === "pt") return "Portuguese";
  if (primary === "ru") return "Russian";
  if (primary === "zh") return "Chinese";
  if (primary === "ja") return "Japanese";
  if (primary === "ko") return "Korean";
  return "English";
}
