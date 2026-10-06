import type { DomainResult } from "@/lib/domains/availability";
import { lookupDomainNames } from "@/lib/domains/lookup";
import { normalizeDomainSearchInput } from "@/lib/domains/normalize";
import {
  buildRecommendationFqdns,
  filterRegisterableRecommendations,
  getRecommendationTierPools,
  recommendationResultLimit,
  sortRecommendationResults,
} from "@/lib/domains/recommendation-tlds";
import { shouldFetchTier2 } from "@/lib/domains/search-orchestrator";

export type SingleFlowSearchResult = {
  anchorDomain: string;
  query: string;
  primary: DomainResult | null;
  recommendations: DomainResult[];
  tier1PoolSize: number;
  tier2PoolSize: number;
  tier2Fetched: boolean;
  alternativesComplete: boolean;
  source: "registrar" | "catalog";
};

function mergeRecommendations(
  base: DomainResult[],
  more: DomainResult[],
): DomainResult[] {
  const map = new Map<string, DomainResult>();
  for (const row of [...base, ...more]) {
    map.set(row.domain.toLowerCase(), row);
  }
  return sortRecommendationResults([...map.values()]).slice(
    0,
    recommendationResultLimit(),
  );
}

/** Server-side full single search: primary → tier1 → tier2 with provider pacing. */
export async function runSingleFlowDomainSearch(
  queryRaw: string,
): Promise<SingleFlowSearchResult> {
  const normalized = normalizeDomainSearchInput(queryRaw);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  const { name, tld, query } = normalized;
  const { tier1, tier2 } = await getRecommendationTierPools();
  const anchorDomain = tld
    ? `${name}${tld}`.toLowerCase()
    : `${name}${tier1[0] ?? ".com"}`.toLowerCase();

  const primaryLookup = await lookupDomainNames([anchorDomain], { query });
  const primary = primaryLookup.results[0] ?? null;
  let source = primaryLookup.source;

  const tier1Fqdns = buildRecommendationFqdns(name, anchorDomain, tier1);
  let recommendations: DomainResult[] = [];
  if (tier1Fqdns.length) {
    const tier1Lookup = await lookupDomainNames(tier1Fqdns, {
      query,
      tlds: tier1,
    });
    source = tier1Lookup.source;
    recommendations = mergeRecommendations(
      [],
      filterRegisterableRecommendations(tier1Lookup.results),
    );
  }

  let tier2Fetched = false;
  if (shouldFetchTier2(recommendations.length, true) && tier2.length > 0) {
    const tier2Fqdns = buildRecommendationFqdns(name, anchorDomain, tier2);
    if (tier2Fqdns.length) {
      const tier2Lookup = await lookupDomainNames(tier2Fqdns, {
        query,
        tlds: tier2,
      });
      tier2Fetched = true;
      recommendations = mergeRecommendations(
        recommendations,
        filterRegisterableRecommendations(tier2Lookup.results),
      );
    }
  }

  return {
    anchorDomain,
    query,
    primary,
    recommendations,
    tier1PoolSize: tier1.length,
    tier2PoolSize: tier2.length,
    tier2Fetched,
    alternativesComplete: true,
    source,
  };
}
