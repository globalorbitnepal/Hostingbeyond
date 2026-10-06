#!/usr/bin/env node
/** Read-only search pipeline audit — no secrets in output. */
import { config as loadDotenv } from "dotenv";
loadDotenv();

const LABEL = process.argv[2] || "mytriphost";

const { normalizeDomainSearchInput } = await import(
  "../lib/domains/normalize.ts"
);
const {
  getRecommendationTierPools,
  buildRecommendationFqdns,
  filterRegisterableRecommendations,
  recommendationResultLimit,
} = await import("../lib/domains/recommendation-tlds.ts");
const { lookupDomainNames } = await import("../lib/domains/lookup.ts");
const { runPhasedDomainSearch, shouldFetchTier2 } = await import(
  "../lib/domains/search-orchestrator.ts"
);
const { countProviderSupportedTlds } = await import(
  "../lib/domains/tld-catalogue-cache.ts"
);

const normalized = normalizeDomainSearchInput(LABEL);
if (!normalized.ok) {
  console.log(JSON.stringify({ error: normalized.error }));
  process.exit(1);
}

const { name, tld, query } = normalized;
const pools = await getRecommendationTierPools();
const anchorDomain = tld
  ? `${name}${tld}`.toLowerCase()
  : `${name}${pools.tier1[0] ?? ".com"}`.toLowerCase();

const tier1Fqdns = buildRecommendationFqdns(name, anchorDomain, pools.tier1);
const tier2Fqdns = buildRecommendationFqdns(name, anchorDomain, pools.tier2);

const primary = await lookupDomainNames([anchorDomain], { query });
const tier1Raw = tier1Fqdns.length
  ? await lookupDomainNames(tier1Fqdns, { query, tlds: pools.tier1 })
  : { results: [], source: "registrar" };
const tier2Raw = tier2Fqdns.length
  ? await lookupDomainNames(tier2Fqdns, { query, tlds: pools.tier2 })
  : { results: [], source: "registrar" };

function tally(results) {
  const counts = {
    available: 0,
    taken: 0,
    premium: 0,
    unknown: 0,
    invalid: 0,
  };
  for (const r of results) {
    if (r.status in counts) counts[r.status]++;
  }
  return counts;
}

const tier1Reg = filterRegisterableRecommendations(tier1Raw.results);
const tier2Reg = filterRegisterableRecommendations(tier2Raw.results);
const needTier2 = shouldFetchTier2(tier1Reg.length, true);

const phasedT1 = await runPhasedDomainSearch(LABEL, { tier: 1 });

let phasedT2 = null;
if (needTier2) {
  phasedT2 = await runPhasedDomainSearch(LABEL, {
    tier: 2,
    existingRecommendations: tier1Reg.length,
  });
}

const searchableCount = await countProviderSupportedTlds();

console.log(
  JSON.stringify(
    {
      label: LABEL,
      anchorDomain,
      searchableCatalogueCount: searchableCount,
      tier1PoolSize: pools.tier1.length,
      tier2PoolSize: pools.tier2.length,
      candidateFqdnsTier1: tier1Fqdns.length,
      candidateFqdnsTier2: tier2Fqdns.length,
      sentToProviderTier1: tier1Fqdns.length,
      sentToProviderTier2: tier2Fqdns.length,
      primary: {
        domain: primary.results[0]?.domain,
        status: primary.results[0]?.status,
      },
      tier1Returned: tier1Raw.results.length,
      tier1Tally: tally(tier1Raw.results),
      tier1Registerable: tier1Reg.length,
      tier1RegisterableSample: tier1Reg.slice(0, 12).map((r) => ({
        domain: r.domain,
        status: r.status,
        register: r.register,
      })),
      shouldFetchTier2: needTier2,
      tier2Returned: tier2Raw.results.length,
      tier2Tally: tally(tier2Raw.results),
      tier2Registerable: tier2Reg.length,
      tier2RegisterableSample: tier2Reg.slice(0, 12).map((r) => ({
        domain: r.domain,
        status: r.status,
      })),
      phasedTier1Recommendations: phasedT1.recommendations.length,
      phasedTier2Recommendations: phasedT2?.recommendations.length ?? null,
      resultLimit: recommendationResultLimit(),
      filteredOutTier1: tier1Raw.results.length - tier1Reg.length,
      filterReason:
        "filterRegisterableRecommendations keeps status=available or (premium with register price)",
    },
    null,
    2,
  ),
);
