import {
  beyondMasterAdminStatus,
  readBeyondMasterRuntimeConfig,
  type BeyondMasterProviderId,
} from "@/lib/beyond-master/settings";

export type BeyondMasterCatalogAdapter = {
  provider: BeyondMasterProviderId;
  protocol: "openai-compatible" | "anthropic";
  defaultBaseUrl: string;
};

/** Adapter families the app can speak. Not a claim that a model is live. */
export const BEYOND_MASTER_ADAPTERS: readonly BeyondMasterCatalogAdapter[] = [
  {
    provider: "openai",
    protocol: "openai-compatible",
    defaultBaseUrl: "https://api.openai.com/v1",
  },
  {
    provider: "anthropic",
    protocol: "anthropic",
    defaultBaseUrl: "https://api.anthropic.com",
  },
  {
    provider: "openai-compatible",
    protocol: "openai-compatible",
    defaultBaseUrl: "",
  },
];

export type BeyondMasterPublicModel = {
  id: string;
  provider: BeyondMasterProviderId;
  available: boolean;
  liveVerified: false;
  reason: string | null;
};

/**
 * Public catalog is only the env-configured model. Extra names are not invented.
 * liveVerified stays false until a controlled provider request is recorded.
 */
export function listBeyondMasterPublicModels(
  env: Record<string, string | undefined> = process.env,
): {
  configured: boolean;
  models: BeyondMasterPublicModel[];
  configurationError: string | null;
} {
  const config = readBeyondMasterRuntimeConfig(env);
  if (!config.provider || !config.model) {
    return {
      configured: false,
      models: [],
      configurationError: config.configurationError,
    };
  }
  const available = config.configured;
  return {
    configured: available,
    configurationError: config.configurationError,
    models: [
      {
        id: config.model,
        provider: config.provider,
        available,
        liveVerified: false,
        reason: available
          ? "Credentials are present. This model has not been live-verified in this session."
          : config.configurationError,
      },
    ],
  };
}

export function authorizeBeyondMasterModel(
  requested: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
): { ok: true; model: string } | { ok: false; error: string } {
  const catalog = listBeyondMasterPublicModels(env);
  const configured = catalog.models[0];
  if (!requested) {
    if (!configured?.available) {
      return {
        ok: false,
        error: "No AI model is configured for Beyond Master.",
      };
    }
    return { ok: true, model: configured.id };
  }
  if (!configured || requested !== configured.id) {
    return { ok: false, error: "That model is not available." };
  }
  if (!configured.available) {
    return { ok: false, error: "That model is not available." };
  }
  return { ok: true, model: configured.id };
}

export function beyondMasterOrbitModelStatus(
  env: Record<string, string | undefined> = process.env,
) {
  const status = beyondMasterAdminStatus(env);
  const catalog = listBeyondMasterPublicModels(env);
  return {
    ...status,
    adapters: BEYOND_MASTER_ADAPTERS.map((row) => ({
      provider: row.provider,
      protocol: row.protocol,
      defaultBaseHost: row.defaultBaseUrl
        ? new URL(row.defaultBaseUrl).host
        : null,
    })),
    models: catalog.models.map((row) => ({
      id: row.id,
      provider: row.provider,
      available: row.available,
      liveVerified: row.liveVerified,
      reason: row.reason,
    })),
  };
}
