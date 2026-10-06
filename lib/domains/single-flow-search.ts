import type { DomainResult } from "@/lib/domains/availability";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  collectTopRecommendations,
  getFastRecommendationBatches,
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

  let recommendations: DomainResult[] = [];
  let batch1Ms = 0;
  let batch2Ms = 0;
  let tier2Fetched = false;

  if (batch1.length) {
    const b1Start = Date.now();
    const tier1 = await collectTopRecommendations(
      name,
      anchorDomain,
      query,
      batch1,
    );
    batch1Ms = Date.now() - b1Start;
    recommendations = tier1.recommendations;
    source = "registrar";
  }

  if (shouldFetchTier2(recommendations.length, true) && batch2.length > 0) {
    const b2Start = Date.now();
    const tier2 = await collectTopRecommendations(
      name,
      anchorDomain,
      query,
      batch2,
      recommendations.map((r) => ({ ...r })),
    );
    batch2Ms = Date.now() - b2Start;
    tier2Fetched = true;
    recommendations = tier2.recommendations;
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
  const started = Date.now();
  const collected = await collectTopRecommendations(
    name,
    anchorDomain,
    query,
    pool,
  );
  const batchMs = Date.now() - started;
  const scannedEntirePool = collected.scannedEntirePool;
  return {
    recommendations: collected.recommendations,
    anchorDomain,
    extensionsChecked: collected.extensionsChecked,
    suggestTier2:
      batch === 1 &&
      shouldFetchTier2(collected.recommendations.length, scannedEntirePool),
    batchMs,
  };
}
