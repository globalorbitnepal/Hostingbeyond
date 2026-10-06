import type { DomainResult } from "@/lib/domains/availability";
import { searchDomainsWithProvider } from "@/lib/domains/domain-service";
import { DomainProviderError } from "@/lib/domains/providers/types";
import { splitDomain } from "@/lib/domains/tlds";
import { PRICE_BY_TLD } from "@/lib/domains/tlds";
import {
  isAvailabilityProviderConfigured,
  resolveAvailabilityProvider,
} from "@/lib/domains/providers/index";

const LOOKUP_TIMEOUT_MS = 15_000;

export function isRegistrarLookupConfigured(): boolean {
  return Boolean(process.env.DOMAIN_LOOKUP_URL?.trim());
}

export function isDomainProviderConfigured(): boolean {
  if (isAvailabilityProviderConfigured()) return true;
  return isRegistrarLookupConfigured();
}

function normalizeUpstreamResult(raw: unknown): DomainResult | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const domain = String(o.domain ?? "")
    .trim()
    .toLowerCase();
  if (!domain) return null;
  const status = o.status;
  if (
    status !== "available" &&
    status !== "taken" &&
    status !== "premium" &&
    status !== "invalid" &&
    status !== "unknown"
  ) {
    return null;
  }
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  return {
    domain,
    name: String(o.name ?? domain.split(".")[0] ?? ""),
    tld: String(o.tld ?? ""),
    status,
    register: num(o.register),
    renew: num(o.renew),
    transfer: num(o.transfer),
    message: typeof o.message === "string" ? o.message : undefined,
  };
}

function applyCatalogPricing(result: DomainResult): DomainResult {
  const price = PRICE_BY_TLD.get(result.tld);
  if (!price) {
    if (result.status === "invalid") return result;
    return {
      ...result,
      message:
        result.message ??
        `We do not sell ${result.tld || "that extension"} yet — try another extension.`,
      status: "invalid",
      register: null,
      renew: null,
      transfer: null,
    };
  }
  if (result.status === "taken") {
    return {
      ...result,
      transfer: result.transfer ?? price.transfer,
      renew: result.renew ?? price.renew,
    };
  }
  if (result.status === "premium" || result.status === "available") {
    return {
      ...result,
      register: result.register ?? price.register,
      renew: result.renew ?? price.renew,
      transfer: result.transfer ?? price.transfer,
    };
  }
  return result;
}

async function fetchLegacyProxyResults(payload: {
  query?: string;
  bulk?: string;
  tlds?: string[];
  names?: string[];
}): Promise<DomainResult[]> {
  const upstream = process.env.DOMAIN_LOOKUP_URL!.trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(upstream, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.DOMAIN_LOOKUP_TOKEN
          ? { authorization: `Bearer ${process.env.DOMAIN_LOOKUP_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("lookup_failed");
    const json = (await response.json()) as { results?: unknown[] };
    if (!Array.isArray(json.results)) throw new Error("lookup_invalid");
    const results = json.results
      .map(normalizeUpstreamResult)
      .filter((item): item is DomainResult => item !== null)
      .map(applyCatalogPricing);
    if (!results.length) throw new Error("lookup_empty");
    return results;
  } finally {
    clearTimeout(timer);
  }
}

export type LookupSource = "registrar" | "catalog";

export async function lookupDomainNames(
  names: string[],
  payload: { query?: string; bulk?: string; tlds?: string[] },
): Promise<{ results: DomainResult[]; source: LookupSource }> {
  if (resolveAvailabilityProvider()) {
    const fqdns = names.map((input) => {
      const { name, tld } = splitDomain(input);
      return `${name}${tld || ".com"}`.toLowerCase();
    });
    try {
      return await searchDomainsWithProvider(fqdns);
    } catch (error) {
      if (error instanceof DomainProviderError) {
        throw new Error(error.code);
      }
      throw error;
    }
  }

  if (isRegistrarLookupConfigured()) {
    const results = await fetchLegacyProxyResults({ ...payload, names });
    return { results, source: "registrar" };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("lookup_unconfigured");
  }

  throw new Error("lookup_unconfigured");
}

export function lookupErrorMessage(code: string): string {
  switch (code) {
    case "timeout":
      return "Domain search is taking longer than expected. Please try again.";
    case "rate_limit":
      return "Domain availability is temporarily taking longer than usual. Please try again.";
    case "insufficient_balance":
      return "Domain registration is temporarily unavailable. Please try again later.";
    case "live_api_blocked_in_dev":
    case "lookup_unconfigured":
    case "provider_failure":
    case "lookup_failed":
    case "lookup_invalid":
    case "lookup_empty":
    case "tld_unsupported":
      return "We couldn't check this domain right now. Please try again.";
    case "invalid_domain":
      return "Please enter a valid domain name.";
    default:
      return "We couldn't check this domain right now. Please try again.";
  }
}
