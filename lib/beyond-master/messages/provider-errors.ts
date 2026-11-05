import { BeyondMasterProviderError as ProviderError } from "@/lib/beyond-master/providers/stream";
import {
  primaryLanguageSubtag,
  type ConversationLocale,
} from "@/lib/beyond-master/locale";

type ErrorCode =
  | "timeout"
  | "unauthorized"
  | "rate_limited"
  | "model_unavailable"
  | "empty"
  | "aborted"
  | "unavailable"
  | "upstream";

type MessageSet = Record<ErrorCode, string>;

const EN: MessageSet = {
  timeout: "The AI provider did not answer in time. Please try again shortly.",
  unauthorized:
    "AI support is temporarily unavailable. Please contact our support team.",
  rate_limited:
    "Our AI Agent has temporarily reached its available usage limit. Please try again later or contact our support team.",
  model_unavailable:
    "AI Agent is temporarily unavailable. Please try again shortly or contact support.",
  empty: "The AI returned an empty reply. Please send your message again.",
  aborted: "The request was cancelled.",
  unavailable:
    "AI Agent is temporarily unavailable. Please try again later or contact support.",
  upstream:
    "The AI could not complete this reply. Try again or contact support.",
};

const HI: MessageSet = {
  timeout: "AI प्रदाता ने समय पर जवाब नहीं दिया। थोड़ी देर बाद फिर कोशिश करें।",
  unauthorized:
    "AI सहायता अस्थायी रूप से उपलब्ध नहीं है। हमारी सपोर्ट टीम से संपर्क करें।",
  rate_limited:
    "हमारे AI Agent की उपलब्ध उपयोग सीमा फिलहाल पूरी हो गई है। कृपया कुछ समय बाद दोबारा प्रयास करें या हमारी सपोर्ट टीम से संपर्क करें।",
  model_unavailable:
    "AI Agent अस्थायी रूप से उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर कोशिश करें या सपोर्ट से संपर्क करें।",
  empty: "AI से खाली जवाब मिला। फिर से भेजें।",
  aborted: "अनुरोध रद्द कर दिया गया।",
  unavailable:
    "AI Agent अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें या सपोर्ट से संपर्क करें।",
  upstream:
    "AI जवाब पूरा नहीं हो सका। फिर कोशिश करें या सपोर्ट से संपर्क करें।",
};

const NE: MessageSet = {
  timeout: "AI प्रदायकले समयमै जवाफ दिएन। केही बेरपछि फेरि प्रयास गर्नुहोस्।",
  unauthorized:
    "AI सहयोग अस्थायी रूपमा उपलब्ध छैन। कृपया सहयोग टोलीसँग सम्पर्क गर्नुहोस्।",
  rate_limited:
    "हाम्रो AI Agent को उपलब्ध प्रयोग सीमा अहिले पूरा भएको छ। कृपया केही समयपछि फेरि प्रयास गर्नुहोस्, वा हाम्रो सहयोग टोलीसँग सम्पर्क गर्नुहोस्।",
  model_unavailable:
    "AI Agent अस्थायी रूपमा उपलब्ध छैन। कृपया केही बेरपछि फेरि प्रयास गर्नुहोस् वा सहयोगमा सम्पर्क गर्नुहोस्।",
  empty: "AI बाट खाली जवाफ आयो। फेरि पठाउनुहोस्।",
  aborted: "अनुरोध रद्द गरियो।",
  unavailable:
    "AI Agent अस्थायी रूपमा उपलब्ध छैन। कृपया पछि फेरि प्रयास गर्नुहोस् वा सहयोगमा सम्पर्क गर्नुहोस्।",
  upstream:
    "AI जवाफ पूरा हुन सकेन। फेरि प्रयास गर्नुहोस् वा सहयोगमा सम्पर्क गर्नुहोस्।",
};

const ES: MessageSet = {
  timeout:
    "El proveedor de IA no respondió a tiempo. Inténtelo de nuevo en un momento.",
  unauthorized:
    "La asistencia con IA no está disponible temporalmente. Contacte con soporte.",
  rate_limited:
    "El agente de IA alcanzó temporalmente su límite de uso. Inténtelo más tarde o contacte con soporte.",
  model_unavailable:
    "El agente de IA no está disponible temporalmente. Inténtelo más tarde o contacte con soporte.",
  empty: "La IA devolvió una respuesta vacía. Envíe el mensaje otra vez.",
  aborted: "La solicitud fue cancelada.",
  unavailable:
    "El agente de IA no está disponible temporalmente. Inténtelo más tarde o contacte con soporte.",
  upstream:
    "La IA no pudo completar la respuesta. Inténtelo de nuevo o contacte con soporte.",
};

const FR: MessageSet = {
  timeout:
    "Le fournisseur d'IA n'a pas répondu à temps. Réessayez dans un instant.",
  unauthorized:
    "L'assistance IA est temporairement indisponible. Contactez le support.",
  rate_limited:
    "L'agent IA a temporairement atteint sa limite d'utilisation. Réessayez plus tard ou contactez le support.",
  model_unavailable:
    "L'agent IA est temporairement indisponible. Réessayez plus tard ou contactez le support.",
  empty: "L'IA a renvoyé une réponse vide. Renvoyez votre message.",
  aborted: "La demande a été annulée.",
  unavailable:
    "L'agent IA est temporairement indisponible. Réessayez plus tard ou contactez le support.",
  upstream:
    "L'IA n'a pas pu terminer la réponse. Réessayez ou contactez le support.",
};

const AR: MessageSet = {
  timeout:
    "لم يُجِب مزوّد الذكاء الاصطناعي في الوقت المحدد. حاول مرة أخرى بعد قليل.",
  unauthorized:
    "دعم الذكاء الاصطناعي غير متاح مؤقتًا. يرجى التواصل مع فريق الدعم.",
  rate_limited:
    "وصل وكيل الذكاء الاصطناعي مؤقتًا إلى حد الاستخدام المتاح. حاول لاحقًا أو تواصل مع الدعم.",
  model_unavailable:
    "وكيل الذكاء الاصطناعي غير متاح مؤقتًا. حاول لاحقًا أو تواصل مع الدعم.",
  empty: "أعاد الذكاء الاصطناعي ردًا فارغًا. أرسل رسالتك مرة أخرى.",
  aborted: "تم إلغاء الطلب.",
  unavailable:
    "وكيل الذكاء الاصطناعي غير متاح مؤقتًا. حاول لاحقًا أو تواصل مع الدعم.",
  upstream:
    "تعذّر على الذكاء الاصطناعي إكمال الرد. حاول مرة أخرى أو تواصل مع الدعم.",
};

const BN: MessageSet = {
  timeout: "AI প্রদানকারী সময়মতো উত্তর দেননি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  unauthorized:
    "AI সহায়তা সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
  rate_limited:
    "AI Agent সাময়িকভাবে ব্যবহারের সীমায় পৌঁছেছে। পরে আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন।",
  model_unavailable:
    "AI Agent সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন।",
  empty: "AI খালি উত্তর দিয়েছে। আবার পাঠান।",
  aborted: "অনুরোধ বাতিল হয়েছে।",
  unavailable:
    "AI Agent সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন।",
  upstream:
    "AI উত্তর সম্পূর্ণ করতে পারেনি। আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন।",
};

const BY_PRIMARY: Partial<Record<string, MessageSet>> = {
  en: EN,
  hi: HI,
  ne: NE,
  es: ES,
  fr: FR,
  ar: AR,
  bn: BN,
};

function errorCode(error: unknown): ErrorCode {
  if (error instanceof ProviderError) {
    if (error.code === "upstream") return "upstream";
    return error.code as ErrorCode;
  }
  return "upstream";
}

export function localizedProviderError(
  error: unknown,
  locale?: ConversationLocale | null,
): string {
  const code = errorCode(error);
  const primary = primaryLanguageSubtag(locale ?? "en");
  const set = BY_PRIMARY[primary] ?? EN;
  return set[code] ?? EN[code];
}
