/** Language detection for customer messages. No network, no guessing about content. */

export type AgentLanguage = "en" | "hi" | "ne";

const NEPALI_DEVANAGARI =
  /गर्नु|गर्छ|गर्ने|कसरी|किन|कहाँ|हुन्छ|होला|मलाई|तपाईं|पर्छ|सक्छ|भयो|छु|छन्|राख्न|पाउँ|चाहिन्छ|कति/;
const HINDI_DEVANAGARI =
  /कैसे|क्या|क्यों|कहां|मुझे|आप|चाहिए|करना|करें|बताओ|बताइए|होगा|है|हैं|कीमत|दाम|रखना|चाहता|चाहती/;

const NEPALI_ROMAN =
  /\b(kasari|kati|chahincha|chahinchha|bhanne|bhaneko|garna|garnu|malai|tapai|huncha|hola|bhayo|ramro|paisa|rakhna|sakchha)\b/i;
const HINDI_ROMAN =
  /\b(kaise|kya|kyu|kyun|kahan|kitna|kitne|chahiye|chaiye|batao|bataiye|karo|karna|kare|hai|hain|mujhe|mera|meri|aap|nahi|nahin|kaisa|kripya|mulya|daam|paisa|chahiye)\b/i;

export function detectAgentLanguage(message: string): AgentLanguage {
  const text = message.trim();
  if (!text) return "en";
  if (/[\u0900-\u097F]/.test(text)) {
    if (NEPALI_DEVANAGARI.test(text)) return "ne";
    if (HINDI_DEVANAGARI.test(text)) return "hi";
    return "hi";
  }
  if (NEPALI_ROMAN.test(text)) return "ne";
  if (HINDI_ROMAN.test(text)) return "hi";
  return "en";
}
