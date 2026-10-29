import {
  googleCloudTranslateCredentialsPath,
  googleCloudTranslateProjectId,
  isGoogleCloudTranslateEnabled,
} from "@/lib/integrations/translation/config";

export type CloudTranslateBatchInput = {
  texts: readonly string[];
  targetLanguage: string;
  sourceLanguage?: string;
};

export type CloudTranslateFn = (
  input: CloudTranslateBatchInput,
  env?: Record<string, string | undefined>,
) => Promise<string[]>;

export type GoogleCloudTranslateErrorCode =
  | "translation_not_configured"
  | "translation_failed"
  | "translation_length_mismatch"
  | "translation_auth_failed"
  | "translation_permission_denied"
  | "translation_quota";

export type GoogleCloudTranslateResult =
  | { ok: true; translations: string[] }
  | { ok: false; code: GoogleCloudTranslateErrorCode };

export function classifyTranslateError(
  error: unknown,
): GoogleCloudTranslateErrorCode {
  const raw =
    error && typeof error === "object"
      ? `${(error as { code?: unknown }).code ?? ""} ${
          (error as { message?: unknown }).message ?? ""
        } ${(error as { details?: unknown }).details ?? ""}`
      : String(error ?? "");
  const text = raw.toLowerCase();
  if (
    text.includes("unauthenticated") ||
    text.includes("invalid_grant") ||
    text.includes("could not load the default credentials") ||
    /\b16\b/.test(text)
  ) {
    return "translation_auth_failed";
  }
  if (
    text.includes("permission_denied") ||
    text.includes("permission denied") ||
    text.includes("iam") ||
    /\b7\b/.test(text)
  ) {
    return "translation_permission_denied";
  }
  if (
    text.includes("resource_exhausted") ||
    text.includes("quota") ||
    text.includes("rate limit") ||
    /\b8\b/.test(text)
  ) {
    return "translation_quota";
  }
  return "translation_failed";
}

async function defaultCloudTranslate(
  input: CloudTranslateBatchInput,
  env: Record<string, string | undefined> = process.env,
): Promise<string[]> {
  const projectId = googleCloudTranslateProjectId(env);
  const keyFilename = googleCloudTranslateCredentialsPath(env);
  if (!keyFilename) {
    throw new Error("translation_not_configured");
  }
  const { TranslationServiceClient } = await import("@google-cloud/translate");
  const client = new TranslationServiceClient({ projectId, keyFilename });
  const [response] = await client.translateText({
    parent: `projects/${projectId}/locations/global`,
    contents: [...input.texts],
    mimeType: "text/plain",
    sourceLanguageCode: input.sourceLanguage ?? "en",
    targetLanguageCode: input.targetLanguage,
  });
  return (response.translations ?? []).map((row) => row.translatedText ?? "");
}

/**
 * Official Cloud Translation v3 adapter. Does not run unless the enable flag
 * and credentials path are set. Never logs credential material.
 */
export async function translateTextsWithGoogleCloud(
  texts: readonly string[],
  targetLanguage: string,
  env: Record<string, string | undefined> = process.env,
  translateFn: CloudTranslateFn = defaultCloudTranslate,
): Promise<GoogleCloudTranslateResult> {
  if (!isGoogleCloudTranslateEnabled(env)) {
    return { ok: false, code: "translation_not_configured" };
  }
  if (texts.length === 0) {
    return { ok: true, translations: [] };
  }
  try {
    const translations = await translateFn(
      { texts, targetLanguage, sourceLanguage: "en" },
      env,
    );
    if (translations.length !== texts.length) {
      return { ok: false, code: "translation_length_mismatch" };
    }
    return { ok: true, translations };
  } catch (error) {
    return { ok: false, code: classifyTranslateError(error) };
  }
}
