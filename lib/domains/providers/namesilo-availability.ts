import { splitDomain } from "@/lib/domains/tlds";
import { DomainProviderError } from "@/lib/domains/providers/types";
import type { ProviderAvailabilityRow } from "@/lib/domains/providers/types";
import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";

const BATCH_BASE =
  process.env.NAMESILO_BATCH_URL?.trim() || "https://www.namesilo.com/apibatch";
const TIMEOUT_MS = 15_000;
const MAX_BATCH = 200;

function redactSecrets(text: string, apiKey: string): string {
  let out = text;
  if (apiKey) out = out.split(apiKey).join("[REDACTED]");
  return out.replace(/key=[^&\s]+/gi, "key=[REDACTED]");
}

function parseFqdn(fqdn: string): {
  domain: string;
  name: string;
  tld: string;
} {
  const { name, tld } = splitDomain(fqdn);
  const normalizedTld = tld || ".com";
  const domain = `${name}${normalizedTld}`.toLowerCase();
  return { domain, name, tld: normalizedTld };
}

function normalizeUnavailable(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "object" && value !== null && "domain" in value) {
    const d = (value as { domain: unknown }).domain;
    return Array.isArray(d) ? d.map(String) : [String(d)];
  }
  return [String(value)];
}

function normalizeAvailableDomains(
  available: unknown,
): { domain: string; isPremium: boolean }[] {
  if (!available) return [];
  const out: { domain: string; isPremium: boolean }[] = [];

  const pushItem = (item: unknown) => {
    if (typeof item === "string") {
      out.push({ domain: item.toLowerCase(), isPremium: false });
      return;
    }
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      const domain = String(
        record.domain ?? record["#text"] ?? "",
      ).toLowerCase();
      if (!domain) return;
      const attrs =
        record["@attributes"] && typeof record["@attributes"] === "object"
          ? (record["@attributes"] as Record<string, unknown>)
          : null;
      const premiumRaw = record.premium ?? attrs?.premium ?? record["@premium"];
      const isPremium =
        premiumRaw === true ||
        premiumRaw === 1 ||
        String(premiumRaw).toLowerCase() === "true" ||
        String(premiumRaw) === "1";
      out.push({ domain, isPremium });
    }
  };

  if (Array.isArray(available)) {
    for (const item of available) pushItem(item);
    return out;
  }
  if (typeof available === "object" && available !== null) {
    const root = available as Record<string, unknown>;
    if (root.domain) {
      const domains = root.domain;
      if (Array.isArray(domains)) {
        for (const item of domains) pushItem(item);
      } else {
        pushItem(domains);
      }
      return out;
    }
  }
  return out;
}

function mapNameSiloCodeToError(
  code: string | null,
  detail: string,
  apiKey: string,
) {
  const lower = detail.toLowerCase();
  if (
    code === "110" ||
    code === "111" ||
    code === "262" ||
    lower.includes("invalid key")
  ) {
    throw new DomainProviderError("provider_failure", "namesilo_auth");
  }
  if (code === "429" || lower.includes("rate")) {
    throw new DomainProviderError("rate_limit");
  }
  if (code && code !== "300") {
    throw new DomainProviderError(
      "provider_failure",
      redactSecrets(`namesilo_${code}`, apiKey),
    );
  }
}

async function fetchNameSiloBatch(
  domains: string[],
  apiKey: string,
): Promise<{
  available: { domain: string; isPremium: boolean }[];
  unavailable: string[];
  invalid: string[];
}> {
  const params = new URLSearchParams({
    version: "1",
    type: "json",
    key: apiKey,
    domains: domains.join(","),
  });
  const url = `${BATCH_BASE.replace(/\/$/, "")}/checkRegisterAvailability?${params}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new DomainProviderError(
        "provider_failure",
        "namesilo_malformed_json",
      );
    }
    if (!res.ok) {
      throw new DomainProviderError("provider_failure", `http_${res.status}`);
    }
    const reply =
      json && typeof json === "object" && "reply" in json
        ? (json as { reply: unknown }).reply
        : json;
    const record =
      reply && typeof reply === "object"
        ? (reply as Record<string, unknown>)
        : {};
    const code = record.code != null ? String(record.code) : null;
    const detail = String(record.detail ?? "");
    mapNameSiloCodeToError(code, detail, apiKey);

    return {
      available: normalizeAvailableDomains(record.available),
      unavailable: normalizeUnavailable(record.unavailable),
      invalid: normalizeUnavailable(record.invalid),
    };
  } catch (error) {
    if (error instanceof DomainProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new DomainProviderError("timeout");
    }
    throw new DomainProviderError("provider_failure");
  } finally {
    clearTimeout(timer);
  }
}

function rowForStatus(
  fqdn: string,
  status: ProviderAvailabilityRow["status"],
  message?: string,
): ProviderAvailabilityRow {
  const { domain, name, tld } = parseFqdn(fqdn);
  return {
    domain,
    name,
    tld,
    status,
    supplier: {
      register: null,
      renew: null,
      transfer: null,
      currency: "USD",
    },
    message,
  };
}

export function mapNameSiloBucketsToRows(
  requested: string[],
  buckets: {
    available: { domain: string; isPremium: boolean }[];
    unavailable: string[];
    invalid: string[];
  },
): ProviderAvailabilityRow[] {
  const availableSet = new Map(
    buckets.available.map((a) => [a.domain.toLowerCase(), a]),
  );
  const unavailableSet = new Set(
    buckets.unavailable.map((d) => d.toLowerCase()),
  );
  const invalidSet = new Set(buckets.invalid.map((d) => d.toLowerCase()));

  return requested.map((raw) => {
    const key = raw.trim().toLowerCase();
    if (invalidSet.has(key)) {
      return rowForStatus(key, "invalid", "Please enter a valid domain name.");
    }
    if (unavailableSet.has(key)) {
      return rowForStatus(key, "taken", "This domain is already registered.");
    }
    const avail = availableSet.get(key);
    if (avail) {
      // Use standard retail pricing in mapRowToCustomerResult — not NameSilo premium path.
      return rowForStatus(
        key,
        "available",
        avail.isPremium
          ? "Registry premium may apply at checkout — price shown is our standard rate until verified."
          : undefined,
      );
    }
    return rowForStatus(
      key,
      "unknown",
      "Temporarily unavailable — registry check did not complete. Please try again.",
    );
  });
}

let cachedProvider: DomainRegistrarProvider | null = null;

export function getNameSiloAvailabilityProvider(): DomainRegistrarProvider {
  if (cachedProvider) return cachedProvider;

  cachedProvider = {
    id: "namesilo",

    async checkAvailability(
      fqdns: string[],
    ): Promise<ProviderAvailabilityRow[]> {
      const apiKey = process.env.NAMESILO_API_KEY?.trim();
      if (!apiKey) {
        throw new DomainProviderError("unconfigured");
      }
      if (!fqdns.length) return [];

      const normalized = fqdns.map((f) => parseFqdn(f).domain);
      const results: ProviderAvailabilityRow[] = [];

      for (let i = 0; i < normalized.length; i += MAX_BATCH) {
        const chunk = normalized.slice(i, i + MAX_BATCH);
        const buckets = await fetchNameSiloBatch(chunk, apiKey);
        results.push(...mapNameSiloBucketsToRows(chunk, buckets));
      }

      return results;
    },

    async getPricing() {
      throw new DomainProviderError("unconfigured");
    },
    async registerDomain() {
      throw new DomainProviderError("unconfigured");
    },
    async renewDomain() {
      throw new DomainProviderError("unconfigured");
    },
    async transferDomain() {
      throw new DomainProviderError("unconfigured");
    },
    async getDomainDetails() {
      throw new DomainProviderError("unconfigured");
    },
    async updateNameservers() {
      throw new DomainProviderError("unconfigured");
    },
    async getAuthCode() {
      throw new DomainProviderError("unconfigured");
    },
    async lockDomain() {
      throw new DomainProviderError("unconfigured");
    },
    async unlockDomain() {
      throw new DomainProviderError("unconfigured");
    },
    async restoreDomain() {
      throw new DomainProviderError("unconfigured");
    },
    async getDomainList() {
      throw new DomainProviderError("unconfigured");
    },
    async getDomainStatus() {
      throw new DomainProviderError("unconfigured");
    },
  };

  return cachedProvider;
}

/** @internal */
export function clearNameSiloProviderCacheForTests(): void {
  cachedProvider = null;
}
