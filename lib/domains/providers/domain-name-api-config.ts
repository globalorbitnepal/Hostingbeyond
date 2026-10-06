import { DomainProviderError } from "@/lib/domains/providers/types";

export type DomainNameApiConfig = {
  baseUrl: string;
  resellerId: string;
  apiKey: string;
  environment: "test" | "live";
};

export function readDomainNameApiConfig(): DomainNameApiConfig | null {
  const resellerId = process.env.DOMAIN_API_RESELLER_ID?.trim();
  if (!resellerId) return null;

  const envRaw = (process.env.DOMAIN_API_ENV ?? "test").trim().toLowerCase();
  const isLive = envRaw === "live" || envRaw === "production";

  if (!isLive && process.env.NODE_ENV !== "production") {
    // Development must stay on OTE / test credentials only.
  }

  if (process.env.NODE_ENV !== "production" && isLive) {
    throw new DomainProviderError("live_api_blocked_in_dev");
  }

  const apiKey = isLive
    ? process.env.DOMAIN_API_LIVE_KEY?.trim()
    : process.env.DOMAIN_API_TEST_KEY?.trim();

  if (!apiKey) return null;

  const baseUrl = isLive
    ? "https://api.domainresellerapi.com/api/v1"
    : "https://ote.domainresellerapi.com/api/v1";

  return {
    baseUrl,
    resellerId,
    apiKey,
    environment: isLive ? "live" : "test",
  };
}

export function isDomainNameApiConfigured(): boolean {
  try {
    return readDomainNameApiConfig() !== null;
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
