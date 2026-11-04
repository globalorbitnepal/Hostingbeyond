/** Language detection for customer messages. No network, no guessing about content. */

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
  /\b(kasari|kati|chahincha|chahinchha|bhanne|bhaneko|garna|garnu|malai|tapai|huncha|hola|bhayo|ramro|paisa|rakhna|sakchha|hunchha|gardai)\b/i;
const HINDI_ROMAN =
  /\b(kaise|kya|kyu|kyun|kahan|kitna|kitne|chahiye|chaiye|batao|bataiye|karo|karna|kare|hai|hain|mujhe|mera|meri|aap|nahi|nahin|kaisa|kripya|mulya|daam|paisa)\b/i;

function score(text: string, markers: readonly string[]): number {
  let total = 0;
  for (const marker of markers) {
    if (text.includes(marker)) total += 1;
  }
  return total;
}

export function detectAgentLanguage(message: string): AgentLanguage {
  const text = message.trim();
  if (!text) return "en";
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
