import type { DomainResult } from "@/lib/domains/availability";
import {
  fastSearchCacheKey,
  withFastSearchInflightOnly,
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
  alternativeProviderParallelLimit,
  alternativeProviderSubChunkSize,
  buildRecommendationFqdns,
  customerAlternativeLimit,
  getDeepDiscoveryTldPool,
  getFastCustomerTldPool,
  getFastCustomerTldPoolChunk,
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

async function loadFastAlternativesFromProvider(
  name: string,
  anchorTld: string,
  anchorDomain: string,
  query: string,
  options?: { includeAnchorInBulk?: boolean; countryCode?: string | null },
): Promise<{
  alternatives: DomainResult[];
  bulkFqdns: number;
  providerMs: number;
  filterMs: number;
  dnaTimings: DnaRequestTiming[];
  primary: DomainResult | null;
}> {
  const catStart = Date.now();
  const fastTlds = await getFastCustomerTldPool(options?.countryCode);
  const catalogueMs = Date.now() - catStart;
  void catalogueMs;

  const splitAt = Math.max(1, Math.ceil(fastTlds.length / 2));
  const tldsA = fastTlds.slice(0, splitAt);
  const tldsB = fastTlds.slice(splitAt);
  const includeAnchor = options?.includeAnchorInBulk ?? true;
  const poolA = includeAnchor
    ? [...new Set([anchorTld, ...tldsA])]
    : [...new Set(tldsA)];
  const fqdnsA = includeAnchor
    ? [
        ...new Set([
          anchorDomain,
          ...buildRecommendationFqdns(name, anchorDomain, poolA),
        ]),
      ]
    : buildRecommendationFqdns(name, anchorDomain, poolA);
  const fqdnsB = buildRecommendationFqdns(name, anchorDomain, tldsB);
  const bulkFqdns = fqdnsA.length + fqdnsB.length;

  clearDnaRequestTraces();
  const providerStart = Date.now();
  const [lookupA, lookupB] = await Promise.all([
    fqdnsA.length
      ? lookupDomainNames(fqdnsA, { query, tlds: poolA }, { fresh: true })
      : Promise.resolve({ results: [], source: "registrar" as const }),
    fqdnsB.length
      ? lookupDomainNames(fqdnsB, { query, tlds: tldsB }, { fresh: true })
      : Promise.resolve({ results: [], source: "registrar" as const }),
  ]);
  const providerMs = Date.now() - providerStart;
  const dnaTimings = mapDnaTraces(getDnaRequestTraces());

  const filterStart = Date.now();
  const merged = [...lookupA.results, ...lookupB.results];
  const primary =
    merged.find((r) => r.domain === anchorDomain) ?? merged[0] ?? null;
  const alternatives = topRegisterableRecommendations(
    merged.filter((r) => r.domain !== anchorDomain),
  );
  const filterMs = Date.now() - filterStart;

  return {
    alternatives,
    bulkFqdns,
    providerMs,
    filterMs,
    dnaTimings,
    primary,
  };
}

async function lookupAlternativeFqdns(
  name: string,
  anchorDomain: string,
  query: string,
  tlds: string[],
): Promise<DomainResult[]> {
  const fqdns = buildRecommendationFqdns(name, anchorDomain, tlds);
  if (!fqdns.length) return [];
  const lookup = await lookupDomainNames(
    fqdns,
    { query, tlds },
    { fresh: true },
  );
  return lookup.results.filter((r) => r.domain !== anchorDomain);
}

async function loadAlternativesForTlds(
  name: string,
  anchorDomain: string,
  query: string,
  tlds: string[],
): Promise<{
  alternatives: DomainResult[];
  bulkFqdns: number;
  providerMs: number;
  providerRequestCount: number;
}> {
  if (!tlds.length) {
    return {
      alternatives: [],
      bulkFqdns: 0,
      providerMs: 0,
      providerRequestCount: 0,
    };
  }

  const subSize = alternativeProviderSubChunkSize();
  const parallel = alternativeProviderParallelLimit();
  clearDnaRequestTraces();
  const providerStart = Date.now();
  let merged: DomainResult[] = [];
  let bulkFqdns = 0;
  let providerRequestCount = 0;

  if (!subSize || tlds.length <= subSize || parallel <= 1) {
    const fqdns = buildRecommendationFqdns(name, anchorDomain, tlds);
    bulkFqdns = fqdns.length;
    providerRequestCount = fqdns.length ? 1 : 0;
    merged = await lookupAlternativeFqdns(name, anchorDomain, query, tlds);
  } else {
    const slices: string[][] = [];
    for (let i = 0; i < tlds.length; i += subSize) {
      slices.push(tlds.slice(i, i + subSize));
    }
    providerRequestCount = slices.length;
    for (let i = 0; i < slices.length; i += parallel) {
      const wave = slices.slice(i, i + parallel);
      const parts = await Promise.all(
        wave.map((slice) =>
          lookupAlternativeFqdns(name, anchorDomain, query, slice),
        ),
      );
      for (const slice of wave) {
        bulkFqdns += buildRecommendationFqdns(name, anchorDomain, slice).length;
      }
      merged = [...merged, ...parts.flat()];
    }
  }

  const providerMs = Date.now() - providerStart;
  const alternatives = topRegisterableRecommendations(merged);
  return { alternatives, bulkFqdns, providerMs, providerRequestCount };
}

/**
 * Stage-1 alternatives: one LIVE bulk on the highest-value TLD chunk only.
 * Stage-2 (`runFastAlternativesChunk2`) covers the rest of the fast pool.
 */
export async function runFastAlternativesChunk1(
  queryRaw: string,
  countryCode?: string | null,
): Promise<{
  anchorDomain: string;
  query: string;
  alternatives: DomainResult[];
  alternativesComplete: boolean;
  fastChunk2Available: boolean;
  deepDiscoveryAvailable: boolean;
  source: "registrar" | "catalog";
  timings: Pick<
    FastSearchTimings,
    | "total_request_time"
    | "provider_request_count"
    | "bulk_fqdn_count"
    | "dna_requests"
    | "dna_requests_overlap"
    | "cache_hit"
  > & { provider_ms?: number; server_overhead_ms?: number };
}> {
  const searchStart = Date.now();
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) throw new Error(normalized.error);

  const { name, tld, query } = normalized;
  const anchorTld = (tld || ".com").toLowerCase();
  const anchorDomain = `${name}${anchorTld}`.toLowerCase();
  const cacheKey = `${fastSearchCacheKey(name)}:alts:c1:${countryCode ?? "global"}`;
  const metricsBefore = getDnaProviderMetrics();

  const chunk1Tlds = await getFastCustomerTldPoolChunk(1, countryCode);
  let bulkFqdns = 0;
  let providerMs = 0;
  const payload = await withFastSearchInflightOnly(cacheKey, async () => {
    const loaded = await loadAlternativesForTlds(
      name,
      anchorDomain,
      query,
      chunk1Tlds,
    );
    bulkFqdns = loaded.bulkFqdns;
    providerMs = loaded.providerMs;
    return {
      anchorDomain,
      query,
      primary: null,
      alternatives: loaded.alternatives,
    };
  });

  const readyAt = Date.now();
  const metrics = getDnaProviderMetrics();
  const limit = customerAlternativeLimit();
  const chunk2Tlds = await getFastCustomerTldPoolChunk(2, countryCode);
  const fastChunk2Available =
    chunk2Tlds.length > 0 && payload.alternatives.length < limit;
  const deepDiscoveryAvailable =
    payload.alternatives.length < limit &&
    (await getDeepDiscoveryTldPool()).length > 0;

  return {
    anchorDomain: payload.anchorDomain,
    query: payload.query,
    alternatives: payload.alternatives,
    alternativesComplete: !fastChunk2Available && !deepDiscoveryAvailable,
    fastChunk2Available,
    deepDiscoveryAvailable,
    source: "registrar",
    timings: {
      total_request_time: readyAt - searchStart,
      provider_request_count: Math.max(
        0,
        metrics.providerRequestCount - metricsBefore.providerRequestCount,
      ),
      bulk_fqdn_count: bulkFqdns,
      dna_requests: mapDnaTraces(getDnaRequestTraces()),
      dna_requests_overlap: false,
      cache_hit: false,
      provider_ms: providerMs,
      server_overhead_ms: Math.max(0, readyAt - searchStart - providerMs),
    },
  };
}

/** Stage-2 fast pool (remaining TLDs before deep discovery). */
export async function runFastAlternativesChunk2(
  queryRaw: string,
  countryCode?: string | null,
): Promise<{
  alternatives: DomainResult[];
  alternativesComplete: boolean;
  deepDiscoveryAvailable: boolean;
  timings: { total_request_time: number; bulk_fqdn_count: number };
}> {
  const searchStart = Date.now();
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) throw new Error(normalized.error);

  const { name, tld, query } = normalized;
  const anchorDomain = `${name}${(tld || ".com").toLowerCase()}`.toLowerCase();
  const chunk2Tlds = await getFastCustomerTldPoolChunk(2, countryCode);

  const loaded = await loadAlternativesForTlds(
    name,
    anchorDomain,
    query,
    chunk2Tlds,
  );
  const merged = topRegisterableRecommendations(loaded.alternatives);
  const limit = customerAlternativeLimit();
  const deepDiscoveryAvailable =
    merged.length < limit && (await getDeepDiscoveryTldPool()).length > 0;

  return {
    alternatives: merged.filter((r) => r.domain !== anchorDomain),
    alternativesComplete: !deepDiscoveryAvailable,
    deepDiscoveryAvailable,
    timings: {
      total_request_time: Date.now() - searchStart,
      bulk_fqdn_count: loaded.bulkFqdns,
    },
  };
}

/** Fast-path alternatives only (no anchor lookup — use after `scope: primary`). */
export async function runFastAlternativesOnly(
  queryRaw: string,
  countryCode?: string | null,
): Promise<{
  anchorDomain: string;
  query: string;
  alternatives: DomainResult[];
  alternativesComplete: boolean;
  deepDiscoveryAvailable: boolean;
  source: "registrar" | "catalog";
  timings: Pick<
    FastSearchTimings,
    | "total_request_time"
    | "provider_request_count"
    | "bulk_fqdn_count"
    | "dna_requests"
    | "dna_requests_overlap"
    | "cache_hit"
  >;
}> {
  const chunk1 = await runFastAlternativesChunk1(queryRaw, countryCode);
  const limit = customerAlternativeLimit();
  const deepDiscoveryAvailable =
    chunk1.alternatives.length < limit &&
    (chunk1.deepDiscoveryAvailable || chunk1.fastChunk2Available);

  return {
    anchorDomain: chunk1.anchorDomain,
    query: chunk1.query,
    alternatives: chunk1.alternatives,
    alternativesComplete: chunk1.alternativesComplete,
    deepDiscoveryAvailable,
    source: chunk1.source,
    timings: chunk1.timings,
  };
}

/**
 * Two overlapping LIVE bulks (empirically ~2× faster than one 15-FQDN bulk on DNA).
 * Anchor travels with the first chunk only.
 */
export async function runFastCustomerSearch(
  queryRaw: string,
  countryCode?: string | null,
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

  const payload = await withFastSearchInflightOnly(
    `${cacheKey}:${countryCode ?? "global"}`,
    async () => {
      const catStart = Date.now();
      await getFastCustomerTldPool(countryCode);
      catalogueMs = Date.now() - catStart;

      const loaded = await loadFastAlternativesFromProvider(
        name,
        anchorTld,
        anchorDomain,
        query,
        { includeAnchorInBulk: true, countryCode },
      );
      bulkFqdns = loaded.bulkFqdns;
      providerMs = loaded.providerMs;
      filterMs = loaded.filterMs;
      dnaTimings = loaded.dnaTimings;

      return {
        anchorDomain,
        query,
        primary: loaded.primary,
        alternatives: loaded.alternatives,
      };
    },
  );
  const cacheHit = false;

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
    ? await lookupDomainNames(fqdns, { query, tlds: deepTlds }, { fresh: true })
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
