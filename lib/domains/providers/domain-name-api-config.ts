import { DomainProviderError } from "@/lib/domains/providers/types";

export type DomainNameApiConfig = {
  baseUrl: string;
  resellerId: string;
  apiKey: string;
  environment: "test" | "live";
  role: "lifecycle" | "availability";
};

const LIVE_BASE = "https://api.domainresellerapi.com/api/v1";
const OTE_BASE = "https://ote.domainresellerapi.com/api/v1";

function parseEnvFlag(
  raw: string | undefined,
  fallback: "test" | "live",
): boolean {
  const v = (raw ?? fallback).trim().toLowerCase();
  return v === "live" || v === "production";
}

function readResellerId(): string | null {
  const resellerId = process.env.DOMAIN_API_RESELLER_ID?.trim();
  return resellerId || null;
}

function buildConfig(
  role: DomainNameApiConfig["role"],
  isLive: boolean,
  apiKey: string,
): DomainNameApiConfig {
  const resellerId = readResellerId();
  if (!resellerId || !apiKey) {
    throw new DomainProviderError("unconfigured");
  }
  return {
    baseUrl: isLive ? LIVE_BASE : OTE_BASE,
    resellerId,
    apiKey,
    environment: isLive ? "live" : "test",
    role,
  };
}

/** Registration, renewal, transfer — defaults to OTE (`DOMAIN_API_ENV=test`). */
export function readDomainNameApiLifecycleConfig(): DomainNameApiConfig | null {
  const resellerId = readResellerId();
  if (!resellerId) return null;

  const isLive = parseEnvFlag(process.env.DOMAIN_API_ENV, "test");

  if (process.env.NODE_ENV !== "production" && isLive) {
    throw new DomainProviderError("live_api_blocked_in_dev");
  }

  const apiKey = isLive
    ? process.env.DOMAIN_API_LIVE_KEY?.trim()
    : process.env.DOMAIN_API_TEST_KEY?.trim();

  if (!apiKey) return null;

  try {
    return buildConfig("lifecycle", isLive, apiKey);
  } catch {
    return null;
  }
}

/**
 * Customer-facing availability — defaults to LIVE in production
 * (`DOMAIN_AVAILABILITY_ENV=live`). Never uses OTE unless explicitly set.
 */
export function readDomainNameApiAvailabilityConfig(): DomainNameApiConfig | null {
  const resellerId = readResellerId();
  if (!resellerId) return null;

  const defaultAvailability =
    process.env.NODE_ENV === "production" ? "live" : "test";
  const isLive = parseEnvFlag(
    process.env.DOMAIN_AVAILABILITY_ENV,
    defaultAvailability,
  );

  const apiKey = isLive
    ? process.env.DOMAIN_API_LIVE_KEY?.trim()
    : process.env.DOMAIN_API_TEST_KEY?.trim();

  if (!apiKey) return null;

  try {
    return buildConfig("availability", isLive, apiKey);
  } catch {
    return null;
  }
}

/** @deprecated use readDomainNameApiLifecycleConfig */
export function readDomainNameApiConfig(): DomainNameApiConfig | null {
  return readDomainNameApiLifecycleConfig();
}

export function isDomainNameApiLifecycleConfigured(): boolean {
  try {
    return readDomainNameApiLifecycleConfig() !== null;
  } catch (error) {
    if (
      error instanceof DomainProviderError &&
      error.code === "live_api_blocked_in_dev"
    ) {
      return false;
    }
    return false;
  }
}

export function isDomainNameApiAvailabilityConfigured(): boolean {
  try {
    return readDomainNameApiAvailabilityConfig() !== null;
  } catch {
    return false;
  }
}

export function isDomainNameApiConfigured(): boolean {
  return (
    isDomainNameApiLifecycleConfigured() ||
    isDomainNameApiAvailabilityConfigured()
  );
}
