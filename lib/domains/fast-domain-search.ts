import type { DomainResult } from "@/lib/domains/availability";
import {
  fastSearchCacheKey,
  withFastSearchDedup,
} from "@/lib/domains/fast-search-cache";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { getDnaProviderMetrics } from "@/lib/domains/providers/dna-rate-limiter";
import {
  clearDnaRequestTraces,
  getDnaRequestTraces,
  type DnaRequestTrace,
} from "@/lib/domains/providers/dna-request-trace";
import { buildServerTimingHeader } from "@/lib/domains/search-server-timing";
import {
  buildRecommendationFqdns,
  customerAlternativeLimit,
  getDeepDiscoveryTldPool,
  getFastCustomerTldPool,
  topRegisterableRecommendations,
} from "@/lib/domains/recommendation-tlds";

export type DnaRequestTiming = {
  index: number;
  domainCount: number;
  slotAcquiredAt: number;
  httpStartAt: number;
  httpEndAt: number;
  providerMs: number;
};

export type FastSearchTimings = {
  search_start: number;
  cache_lookup_end: number;
  cache_hit: boolean;
  catalogue_ms: number;
  primary_provider_start: number;
  primary_provider_end: number;
  alternative_provider_start: number;
  alternative_provider_end: number;
  first_alternative_ready: number;
  all_visible_results_ready: number;
  filter_ms: number;
  serialize_ms: number;
  total_request_time: number;
  provider_request_count: number;
  bulk_fqdn_count: number;
  rate_limit_429_count: number;
  dna_requests: DnaRequestTiming[];
  dna_requests_overlap: boolean;
  server_timing: string;
};

export type FastCustomerSearchResult = {
  anchorDomain: string;
  query: string;
  primary: DomainResult | null;
  alternatives: DomainResult[];
  alternativesComplete: boolean;
  deepDiscoveryAvailable: boolean;
  source: "registrar" | "catalog";
  timings: FastSearchTimings;
};

export type DeepDiscoveryResult = {
  alternatives: DomainResult[];
  extensionsChecked: number;
  timings: { deep_provider_ms: number; provider_request_count: number };
};

function mapDnaTraces(traces: DnaRequestTrace[]): DnaRequestTiming[] {
  return traces.map((t) => ({
    index: t.requestIndex,
    domainCount: t.domainCount,
    slotAcquiredAt: t.slotAcquiredAt,
    httpStartAt: t.httpStartAt,
    httpEndAt: t.httpEndAt,
    providerMs: Math.max(0, t.httpEndAt - t.httpStartAt),
  }));
}

function tracesOverlap(traces: DnaRequestTiming[]): boolean {
  if (traces.length < 2) return false;
  const a = traces[0]!;
  const b = traces[1]!;
  return a.httpStartAt < b.httpEndAt && b.httpStartAt < a.httpEndAt;
}

/** One LIVE-safe bulk: anchor + curated high-value TLDs (≤25 FQDNs). */
export async function runFastCustomerSearch(
  queryRaw: string,
): Promise<FastCustomerSearchResult> {
  const searchStart = Date.now();
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  const { name, tld, query } = normalized;
  const anchorTld = (tld || ".com").toLowerCase();
  const anchorDomain = `${name}${anchorTld}`.toLowerCase();
  const cacheKey = fastSearchCacheKey(name);
  const metricsBefore = getDnaProviderMetrics();

  let bulkFqdns = 0;
  let catalogueMs = 0;
  let providerMs = 0;
  let filterMs = 0;
  let dnaTimings: DnaRequestTiming[] = [];

  const { payload, cacheHit } = await withFastSearchDedup(
    cacheKey,
    async () => {
      const catStart = Date.now();
      const fastTlds = await getFastCustomerTldPool();
      catalogueMs = Date.now() - catStart;

      const poolTlds = [...new Set([anchorTld, ...fastTlds])];
      const fqdns = [
        ...new Set([
          anchorDomain,
          ...buildRecommendationFqdns(name, anchorDomain, poolTlds),
        ]),
      ];
      bulkFqdns = fqdns.length;

      clearDnaRequestTraces();
      const providerStart = Date.now();
      const lookup = await lookupDomainNames(fqdns, { query, tlds: poolTlds });
      providerMs = Date.now() - providerStart;
      dnaTimings = mapDnaTraces(getDnaRequestTraces());

      const filterStart = Date.now();
      const primary =
        lookup.results.find((r) => r.domain === anchorDomain) ??
        lookup.results[0] ??
        null;
      const alternatives = topRegisterableRecommendations(
        lookup.results.filter((r) => r.domain !== anchorDomain),
      );
      filterMs = Date.now() - filterStart;

      return {
        anchorDomain,
        query,
        primary,
        alternatives,
      };
    },
  );

  const serializeStart = Date.now();
  const readyAt = Date.now();
  const serializeMs = readyAt - serializeStart;

  const metrics = getDnaProviderMetrics();
  const providerCalls = cacheHit
    ? 0
    : Math.max(
        0,
        metrics.providerRequestCount - metricsBefore.providerRequestCount,
      );

  const providerEnd = cacheHit
    ? readyAt
    : searchStart + catalogueMs + providerMs;
  const providerStart = cacheHit ? readyAt : searchStart + catalogueMs;

  const timingParts: Record<string, number | undefined> = {
    cache: cacheHit ? readyAt - searchStart : 0,
    catalogue: cacheHit ? 0 : catalogueMs,
    filter: cacheHit ? 0 : filterMs,
    serialize: serializeMs,
    total: readyAt - searchStart,
  };
  if (!cacheHit) {
    timingParts.primary = providerMs;
    dnaTimings.forEach((d, i) => {
      timingParts[`dna-bulk-${i + 1}`] = d.providerMs;
    });
  }
  const serverTiming = buildServerTimingHeader(timingParts);

  const timings: FastSearchTimings = {
    search_start: searchStart,
    cache_lookup_end: readyAt,
    cache_hit: cacheHit,
    catalogue_ms: cacheHit ? 0 : catalogueMs,
    primary_provider_start: providerStart,
    primary_provider_end: providerEnd,
    alternative_provider_start: providerStart,
    alternative_provider_end: providerEnd,
    first_alternative_ready: providerEnd,
    all_visible_results_ready: readyAt,
    filter_ms: cacheHit ? 0 : filterMs,
    serialize_ms: serializeMs,
    total_request_time: readyAt - searchStart,
    provider_request_count: providerCalls,
    bulk_fqdn_count: cacheHit ? 0 : bulkFqdns,
    rate_limit_429_count: metrics.rateLimit429Count,
    dna_requests: cacheHit ? [] : dnaTimings,
    dna_requests_overlap: cacheHit ? false : tracesOverlap(dnaTimings),
    server_timing: serverTiming,
  };

  const limit = customerAlternativeLimit();
  const deepDiscoveryAvailable =
    !cacheHit &&
    payload.alternatives.length < limit &&
    (await getDeepDiscoveryTldPool()).length > 0;

  return {
    anchorDomain: payload.anchorDomain,
    query: payload.query,
    primary: payload.primary,
    alternatives: payload.alternatives,
    alternativesComplete: !deepDiscoveryAvailable,
    deepDiscoveryAvailable,
    source: "registrar",
    timings,
  };
}

/** Extended pool in one bulk — must not block the fast customer response. */
export async function runDeepDiscoverySearch(
  queryRaw: string,
): Promise<DeepDiscoveryResult> {
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) throw new Error(normalized.error);

  const { name, tld, query } = normalized;
  const anchorDomain = tld
    ? `${name}${tld}`.toLowerCase()
    : `${name}.com`.toLowerCase();

  const deepTlds = await getDeepDiscoveryTldPool();
  const fqdns = buildRecommendationFqdns(name, anchorDomain, deepTlds);
  const started = Date.now();
  const lookup = fqdns.length
    ? await lookupDomainNames(fqdns, { query, tlds: deepTlds })
    : { results: [], source: "registrar" as const };

  return {
    alternatives: topRegisterableRecommendations(lookup.results),
    extensionsChecked: fqdns.length,
    timings: {
      deep_provider_ms: Date.now() - started,
      provider_request_count: getDnaProviderMetrics().providerRequestCount,
    },
  };
}
