import { existsSync } from "node:fs";

import { isEnvPresent, isEnvStrictTrue } from "@/lib/integrations/env-flags";

export const GOOGLE_CLOUD_TRANSLATE_ENV = [
  "GOOGLE_TRANSLATE_ENABLED",
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "GOOGLE_TRANSLATE_CREDENTIALS_PATH",
] as const;

export const GOOGLE_CLOUD_TRANSLATE_DEFAULT_PROJECT = "hostingbeyond-513017";

export function googleCloudTranslateProjectId(
  env: Record<string, string | undefined> = process.env,
): string {
  return (
    env.GOOGLE_CLOUD_PROJECT?.trim() || GOOGLE_CLOUD_TRANSLATE_DEFAULT_PROJECT
  );
}

/** Filesystem path only — never read or return JSON key material. */
export function googleCloudTranslateCredentialsPath(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const dedicated = env.GOOGLE_TRANSLATE_CREDENTIALS_PATH?.trim();
  if (dedicated) return dedicated;
  const adc = env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  return adc || null;
}

export function isGoogleCloudTranslateConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    isEnvPresent(googleCloudTranslateProjectId(env)) &&
    googleCloudTranslateCredentialsPath(env) !== null
  );
}

export function isGoogleCloudTranslateEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    isEnvStrictTrue(env.GOOGLE_TRANSLATE_ENABLED) &&
    isGoogleCloudTranslateConfigured(env)
  );
}

export type GoogleCloudTranslateSetup = {
  enabledFlag: boolean;
  projectId: string;
  credentialsPathConfigured: boolean;
  credentialsFilePresent: boolean;
  adapterEnabled: boolean;
  /** Always false until an authorized translateText call succeeds. */
  liveTranslationVerified: false;
};

export function inspectGoogleCloudTranslateSetup(
  env: Record<string, string | undefined> = process.env,
): GoogleCloudTranslateSetup {
  const credentialsPath = googleCloudTranslateCredentialsPath(env);
  let credentialsFilePresent = false;
  if (credentialsPath) {
    try {
      credentialsFilePresent = existsSync(credentialsPath);
    } catch {
      credentialsFilePresent = false;
    }
  }
  return {
    enabledFlag: isEnvStrictTrue(env.GOOGLE_TRANSLATE_ENABLED),
    projectId: googleCloudTranslateProjectId(env),
    credentialsPathConfigured: credentialsPath !== null,
    credentialsFilePresent,
    adapterEnabled: isGoogleCloudTranslateEnabled(env),
    liveTranslationVerified: false,
  };
}
