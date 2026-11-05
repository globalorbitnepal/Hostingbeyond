import { BEYOND_MASTER_PROVIDER_NOTICE } from "@/lib/beyond-master/copy";
import { GEMINI_DEFAULT_MODEL } from "@/lib/beyond-master/providers/gemini";

export type BeyondMasterProviderId =
  "openai" | "anthropic" | "openai-compatible" | "google";

export type BeyondMasterRuntimeConfig = {
  configured: boolean;
  provider: BeyondMasterProviderId | null;
  model: string | null;
  baseUrl: string | null;
  apiKey: string | null;
  timeoutMs: number;
  maxOutputTokens: number;
  rateLimit: number;
  rateWindowMs: number;
  configurationError: "provider" | "model" | "credentials" | "base_url" | null;
};

const PROVIDERS = new Set<BeyondMasterProviderId>([
  "openai",
  "anthropic",
  "openai-compatible",
  "google",
]);

function positiveInt(value: string | undefined, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export function sanitizeModelName(value: string | undefined): string | null {
  const model = value?.trim() ?? "";
  if (!/^[A-Za-z0-9._:/-]{1,80}$/.test(model)) return null;
  return model;
}

export function sanitizeProviderBaseUrl(
  value: string | undefined,
  provider: BeyondMasterProviderId,
): string | null {
  const fallback =
    provider === "anthropic"
      ? "https://api.anthropic.com"
      : "https://api.openai.com/v1";
  const raw =
    value?.trim() || (provider === "openai-compatible" ? "" : fallback);
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const local =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";
  if (url.protocol === "https:" || (url.protocol === "http:" && local)) {
    return url.toString().replace(/\/$/, "");
  }
  return null;
}

export function readBeyondMasterRuntimeConfig(
  env: Record<string, string | undefined> = process.env,
): BeyondMasterRuntimeConfig {
  const timeoutMs = positiveInt(
    env.BEYOND_MASTER_AI_TIMEOUT_MS,
    45_000,
    120_000,
  );
  const maxOutputTokens = positiveInt(
    env.BEYOND_MASTER_AI_MAX_OUTPUT_TOKENS,
    900,
    4_096,
  );
  const rateLimit = positiveInt(env.BEYOND_MASTER_AI_RATE_LIMIT, 20, 200);
  const rateWindowMs = positiveInt(
    env.BEYOND_MASTER_AI_RATE_WINDOW_MS,
    600_000,
    3_600_000,
  );
  const geminiKey = env.GEMINI_API_KEY?.trim() || null;
  let providerRaw = env.BEYOND_MASTER_AI_PROVIDER?.trim().toLowerCase() ?? "";
  if (!providerRaw && geminiKey) providerRaw = "google";
  const provider = PROVIDERS.has(providerRaw as BeyondMasterProviderId)
    ? (providerRaw as BeyondMasterProviderId)
    : null;
  let model = sanitizeModelName(env.BEYOND_MASTER_AI_MODEL);
  if (provider === "google" && !model) model = GEMINI_DEFAULT_MODEL;
  const apiKey = env.BEYOND_MASTER_AI_API_KEY?.trim() || geminiKey || null;
  const baseUrl =
    provider === "google"
      ? "https://generativelanguage.googleapis.com/v1beta"
      : provider
        ? sanitizeProviderBaseUrl(env.BEYOND_MASTER_AI_BASE_URL, provider)
        : null;

  let configurationError: BeyondMasterRuntimeConfig["configurationError"] =
    null;
  if (!provider) configurationError = providerRaw ? "provider" : null;
  else if (!model) configurationError = "model";
  else if (!apiKey) configurationError = "credentials";
  else if (!baseUrl) configurationError = "base_url";

  const configured = Boolean(provider && model && apiKey && baseUrl);
  return {
    configured,
    provider: configured ? provider : provider,
    model: configured ? model : model,
    baseUrl: configured ? baseUrl : baseUrl,
    apiKey: configured ? apiKey : null,
    timeoutMs,
    maxOutputTokens,
    rateLimit,
    rateWindowMs,
    configurationError: configured ? null : configurationError,
  };
}

/** Safe for Orbit and logs. The API key is never copied onto this object. */
export function beyondMasterAdminStatus(
  env: Record<string, string | undefined> = process.env,
) {
  const config = readBeyondMasterRuntimeConfig(env);
  let baseUrlHost: string | null = null;
  if (config.baseUrl) {
    try {
      baseUrlHost = new URL(config.baseUrl).host;
    } catch {
      baseUrlHost = null;
    }
  }
  return {
    product: "AI Agent",
    configured: config.configured,
    provider: config.provider,
    model: config.model,
    credentialsPresent: Boolean(
      env.BEYOND_MASTER_AI_API_KEY?.trim() || env.GEMINI_API_KEY?.trim(),
    ),
    streaming: true,
    baseUrlHost,
    configurationError: config.configurationError,
    timeoutMs: config.timeoutMs,
    maxOutputTokens: config.maxOutputTokens,
    rateLimit: config.rateLimit,
    rateWindowMs: config.rateWindowMs,
    fallbackNotice: BEYOND_MASTER_PROVIDER_NOTICE,
  };
}
