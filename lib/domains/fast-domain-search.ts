import type { DomainResult } from "@/lib/domains/availability";
import {
  fastSearchCacheKey,
  withFastSearchDedup,
} from "@/lib/domains/fast-search-cache";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import { getDnaProviderMetrics } from "@/lib/domains/providers/dna-rate-limiter";
import {
  buildRecommendationFqdns,
  customerAlternativeLimit,
  getDeepDiscoveryTldPool,
  getFastCustomerTldPool,
  topRegisterableRecommendations,
} from "@/lib/domains/recommendation-tlds";

export type FastSearchTimings = {
  search_start: number;
  cache_lookup_end: number;
  cache_hit: boolean;
  primary_provider_start: number;
  primary_provider_end: number;
  alternative_provider_start: number;
  alternative_provider_end: number;
  first_alternative_ready: number;
  all_visible_results_ready: number;
  total_request_time: number;
  provider_request_count: number;
  bulk_fqdn_count: number;
  rate_limit_429_count: number;
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

/** One provider bulk: anchor + highest-value TLDs (single round trip). */
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

  let providerMs = 0;
  let bulkFqdns = 0;

  const { payload, cacheHit } = await withFastSearchDedup(
    cacheKey,
    async () => {
      const fastTlds = await getFastCustomerTldPool();
      const splitAt = Math.max(1, Math.ceil(fastTlds.length / 2));
      const tldsA = fastTlds.slice(0, splitAt);
      const tldsB = fastTlds.slice(splitAt);
      const poolA = [...new Set([anchorTld, ...tldsA])];
      const fqdnsA = [
        ...new Set([
          anchorDomain,
          ...buildRecommendationFqdns(name, anchorDomain, poolA),
        ]),
      ];
      const fqdnsB = buildRecommendationFqdns(name, anchorDomain, tldsB);
      bulkFqdns = fqdnsA.length + fqdnsB.length;

      const providerStart = Date.now();
      const [lookupA, lookupB] = await Promise.all([
        lookupDomainNames(fqdnsA, { query, tlds: poolA }),
        fqdnsB.length
          ? lookupDomainNames(fqdnsB, { query, tlds: tldsB })
          : Promise.resolve({ results: [], source: "registrar" as const }),
      ]);
      providerMs = Date.now() - providerStart;

      const merged = [...lookupA.results, ...lookupB.results];
      const primary =
        merged.find((r) => r.domain === anchorDomain) ?? merged[0] ?? null;
      const alternatives = topRegisterableRecommendations(
        merged.filter((r) => r.domain !== anchorDomain),
      );

      return {
        anchorDomain,
        query,
        primary,
        alternatives,
      };
    },
  );

  const readyAt = Date.now();
  const metrics = getDnaProviderMetrics();
  const providerCalls = cacheHit
    ? 0
    : Math.max(
        0,
        metrics.providerRequestCount - metricsBefore.providerRequestCount,
      );
  const providerStart = cacheHit ? readyAt : searchStart;
  const providerEnd = cacheHit ? readyAt : searchStart + providerMs;

  const timings: FastSearchTimings = {
    search_start: searchStart,
    cache_lookup_end: readyAt,
    cache_hit: cacheHit,
    primary_provider_start: providerStart,
    primary_provider_end: providerEnd,
    alternative_provider_start: providerStart,
    alternative_provider_end: providerEnd,
    first_alternative_ready: providerEnd,
    all_visible_results_ready: readyAt,
    total_request_time: readyAt - searchStart,
    provider_request_count: providerCalls,
    bulk_fqdn_count: cacheHit ? 0 : bulkFqdns,
    rate_limit_429_count: metrics.rateLimit429Count,
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
