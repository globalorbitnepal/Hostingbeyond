import type { DomainResult } from "@/lib/domains/availability";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  buildRecommendationFqdns,
  getFastRecommendationBatches,
  topRegisterableRecommendations,
} from "@/lib/domains/recommendation-tlds";
import { shouldFetchTier2 } from "@/lib/domains/search-orchestrator";

export type SingleFlowSearchResult = {
  anchorDomain: string;
  query: string;
  primary: DomainResult | null;
  recommendations: DomainResult[];
  batch1Size: number;
  batch2Size: number;
  tier2Fetched: boolean;
  alternativesComplete: boolean;
  source: "registrar" | "catalog";
  timings: {
    primaryMs: number;
    batch1Ms: number;
    batch2Ms: number;
    totalMs: number;
  };
};

/** One bulk-search for recommendations; optional second bulk only if <10 available. */
export async function runSingleFlowDomainSearch(
  queryRaw: string,
): Promise<SingleFlowSearchResult> {
  const started = Date.now();
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  const { name, tld, query } = normalized;
  const { batch1, batch2 } = await getFastRecommendationBatches();
  const anchorDomain = tld
    ? `${name}${tld}`.toLowerCase()
    : `${name}.com`.toLowerCase();

  const primaryStarted = Date.now();
  const primaryLookup = await lookupDomainNames([anchorDomain], { query });
  const primaryMs = Date.now() - primaryStarted;
  const primary = primaryLookup.results[0] ?? null;
  let source = primaryLookup.source;

  const batch1Fqdns = buildRecommendationFqdns(name, anchorDomain, batch1);
  let recommendations: DomainResult[] = [];
  let batch1Ms = 0;
  let batch2Ms = 0;
  let tier2Fetched = false;

  if (batch1Fqdns.length) {
    const b1Start = Date.now();
    const tier1Lookup = await lookupDomainNames(batch1Fqdns, {
      query,
      tlds: batch1,
    });
    batch1Ms = Date.now() - b1Start;
    source = tier1Lookup.source;
    recommendations = topRegisterableRecommendations(tier1Lookup.results);
  }

  if (shouldFetchTier2(recommendations.length, true) && batch2.length > 0) {
    const tier2Fqdns = buildRecommendationFqdns(name, anchorDomain, batch2);
    if (tier2Fqdns.length) {
      const b2Start = Date.now();
      const tier2Lookup = await lookupDomainNames(tier2Fqdns, {
        query,
        tlds: batch2,
      });
      batch2Ms = Date.now() - b2Start;
      tier2Fetched = true;
      const merged = topRegisterableRecommendations([
        ...recommendations,
        ...tier2Lookup.results,
      ]);
      recommendations = merged;
    }
  }

  return {
    anchorDomain,
    query,
    primary,
    recommendations,
    batch1Size: batch1.length,
    batch2Size: batch2.length,
    tier2Fetched,
    alternativesComplete: true,
    source,
    timings: {
      primaryMs,
      batch1Ms,
      batch2Ms,
      totalMs: Date.now() - started,
    },
  };
}

export async function runFastAlternativesOnly(
  queryRaw: string,
  batch: 1 | 2,
): Promise<{
  recommendations: DomainResult[];
  anchorDomain: string;
  extensionsChecked: number;
  suggestTier2: boolean;
  batchMs: number;
}> {
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) throw new Error(normalized.error);
  const { name, tld, query } = normalized;
  const { batch1, batch2 } = await getFastRecommendationBatches();
  const pool = batch === 2 ? batch2 : batch1;
  const anchorDomain = tld
    ? `${name}${tld}`.toLowerCase()
    : `${name}.com`.toLowerCase();
  const fqdns = buildRecommendationFqdns(name, anchorDomain, pool);
  const started = Date.now();
  const lookup = fqdns.length
    ? await lookupDomainNames(fqdns, { query, tlds: pool })
    : { results: [], source: "registrar" as const };
  const recommendations = topRegisterableRecommendations(lookup.results);
  const batchMs = Date.now() - started;
  return {
    recommendations,
    anchorDomain,
    extensionsChecked: fqdns.length,
    suggestTier2: batch === 1 && shouldFetchTier2(recommendations.length, true),
    batchMs,
  };
}
