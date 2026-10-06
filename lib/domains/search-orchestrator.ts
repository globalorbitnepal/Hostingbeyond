import type { DomainResult } from "@/lib/domains/availability";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  collectTopRecommendations,
  customerAlternativeLimit,
  getRecommendationTierPools,
  topRegisterableRecommendations,
} from "@/lib/domains/recommendation-tlds";

export type SearchTimings = {
  serverMs: number;
  primaryMs: number;
  recommendationsMs: number;
};

export type PhasedSearchResult = {
  anchorDomain: string;
  query: string;
  primary: DomainResult | null;
  recommendations: DomainResult[];
  tier: 1 | 2;
  tier1PoolSize: number;
  tier2PoolSize: number;
  extensionsChecked: number;
  alternativesComplete: boolean;
  source: "registrar" | "catalog";
  timings: SearchTimings;
};

function isRegisterable(result: DomainResult) {
  if (result.status === "available") return true;
  if (result.status === "premium" && result.register != null) return true;
  return false;
}

const TIER2_MIN_RESULTS = Number(
  process.env.DOMAIN_RECOMMENDATION_TIER2_MIN_RESULTS ?? 10,
);

export async function runPhasedDomainSearch(
  queryRaw: string,
  options?: { tier?: 1 | 2; existingRecommendations?: number },
): Promise<PhasedSearchResult> {
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  const { name, tld, query } = normalized;
  const tier: 1 | 2 = options?.tier === 2 ? 2 : 1;
  const { tier1, tier2 } = await getRecommendationTierPools();

  const anchorDomain = tld
    ? `${name}${tld}`.toLowerCase()
    : `${name}${tier1[0] ?? ".com"}`.toLowerCase();

  const started = Date.now();
  let primary: DomainResult | null = null;
  let recommendations: DomainResult[] = [];
  let primaryMs = 0;
  let recommendationsMs = 0;
  let extensionsChecked = 0;
  let source: "registrar" | "catalog" = "registrar";
  let tier1ScannedAll = tier !== 1;

  if (tier === 1) {
    const primaryStarted = Date.now();
    const primaryLookup = await lookupDomainNames([anchorDomain], { query });
    primaryMs = Date.now() - primaryStarted;
    source = primaryLookup.source;
    primary = primaryLookup.results[0] ?? null;

    const recStarted = Date.now();
    const tier1Collected = tier1.length
      ? await collectTopRecommendations(name, anchorDomain, query, tier1)
      : {
          recommendations: [],
          extensionsChecked: 0,
          scannedEntirePool: true,
          providerChunks: 0,
        };
    recommendationsMs = Date.now() - recStarted;
    extensionsChecked = 1 + tier1Collected.extensionsChecked;
    recommendations = tier1Collected.recommendations;
    tier1ScannedAll = tier1Collected.scannedEntirePool;
  } else {
    const recStarted = Date.now();
    const tier2Collected = tier2.length
      ? await collectTopRecommendations(name, anchorDomain, query, tier2)
      : {
          recommendations: [],
          extensionsChecked: 0,
          scannedEntirePool: true,
          providerChunks: 0,
        };
    recommendationsMs = Date.now() - recStarted;
    source = "registrar";
    extensionsChecked = tier2Collected.extensionsChecked;
    recommendations = tier2Collected.recommendations;
  }

  const existing = options?.existingRecommendations ?? 0;
  const needsTier2 =
    tier === 1 &&
    tier1ScannedAll &&
    recommendations.filter(isRegisterable).length + existing <
      TIER2_MIN_RESULTS &&
    tier2.length > 0;

  return {
    anchorDomain,
    query,
    primary,
    recommendations,
    tier,
    tier1PoolSize: tier1.length,
    tier2PoolSize: tier2.length,
    extensionsChecked,
    alternativesComplete: tier === 2 || !needsTier2,
    source,
    timings: {
      serverMs: Date.now() - started,
      primaryMs,
      recommendationsMs,
    },
  };
}

export function shouldFetchTier2(
  tier1AvailableCount: number,
  tier1Complete: boolean,
): boolean {
  return (
    tier1Complete &&
    tier1AvailableCount < TIER2_MIN_RESULTS &&
    tier1AvailableCount < customerAlternativeLimit()
  );
}
