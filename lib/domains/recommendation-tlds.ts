import type { DomainResult } from "@/lib/domains/availability";
import { getTldCatalogueSnapshot } from "@/lib/domains/tld-catalogue-cache";

/** Ranking preference only — intersected with synced searchable catalogue. */
export const PRIORITY_TLD_TIERS: string[][] = [
  [
    ".com",
    ".net",
    ".org",
    ".co",
    ".io",
    ".ai",
    ".app",
    ".dev",
    ".tech",
    ".cloud",
    ".online",
    ".site",
    ".store",
    ".shop",
    ".website",
    ".xyz",
    ".pro",
    ".agency",
    ".digital",
    ".blog",
    ".info",
    ".biz",
  ],
  [
    ".me",
    ".tv",
    ".cc",
    ".chat",
    ".studio",
    ".live",
    ".world",
    ".space",
    ".fun",
    ".life",
    ".social",
    ".solutions",
    ".today",
  ],
  [
    ".in",
    ".uk",
    ".us",
    ".ca",
    ".au",
    ".nz",
    ".de",
    ".fr",
    ".it",
    ".es",
    ".nl",
    ".ch",
    ".at",
    ".ae",
    ".sg",
    ".my",
    ".id",
    ".jp",
    ".eu",
  ],
];

const TIER_INDEX = new Map<string, number>();
for (let tier = 0; tier < PRIORITY_TLD_TIERS.length; tier++) {
  for (const tld of PRIORITY_TLD_TIERS[tier]) {
    TIER_INDEX.set(tld.toLowerCase(), tier);
  }
}

export function recommendationTierIndex(tld: string): number {
  const key = tld.startsWith(".") ? tld.toLowerCase() : `.${tld.toLowerCase()}`;
  if (TIER_INDEX.has(key)) return TIER_INDEX.get(key)!;
  if (key.length === 3) return 50;
  return 99;
}

export function sortByRecommendationPriority(a: string, b: string): number {
  const ia = recommendationTierIndex(a);
  const ib = recommendationTierIndex(b);
  if (ia !== ib) return ia - ib;
  return a.localeCompare(b);
}

export function sortRecommendationResults(
  results: DomainResult[],
): DomainResult[] {
  return [...results].sort((a, b) =>
    sortByRecommendationPriority(a.tld, b.tld),
  );
}

/**
 * Ranked TLD candidates per recommendation batch (before anchor exclusion).
 * Provider HTTP bulk-search on LIVE rejects large single payloads (403); domain-service
 * splits availability checks into chunks of DOMAIN_AVAILABILITY_BATCH_SIZE (default 25).
 */
export function providerBulkSearchMaxDomains(): number {
  const raw = Number(process.env.DOMAIN_BULK_SEARCH_MAX_DOMAINS ?? 50);
  if (!Number.isFinite(raw) || raw < 5) return 50;
  return Math.min(Math.max(raw, 5), 50);
}

export function customerAlternativeLimit(): number {
  const raw = Number(process.env.DOMAIN_CUSTOMER_ALTERNATIVE_LIMIT ?? 10);
  if (!Number.isFinite(raw) || raw < 1) return 10;
  return Math.min(Math.max(raw, 1), 20);
}

export function recommendationResultLimit(): number {
  return customerAlternativeLimit();
}

function orderSearchableTlds(searchable: string[]): string[] {
  const set = new Set(searchable.map((t) => t.toLowerCase()));
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const tier of PRIORITY_TLD_TIERS) {
    for (const tld of tier) {
      const key = tld.toLowerCase();
      if (!set.has(key) || seen.has(key)) continue;
      seen.add(key);
      ordered.push(key);
    }
  }

  for (const key of [...set].sort()) {
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(key);
  }

  return ordered;
}

export async function getSearchableTldCatalogue(): Promise<string[]> {
  const snap = await getTldCatalogueSnapshot();
  return orderSearchableTlds(snap.searchable);
}

export async function getFastRecommendationBatches(): Promise<{
  batch1: string[];
  batch2: string[];
  catalogueSize: number;
}> {
  const ordered = await getSearchableTldCatalogue();
  const max = providerBulkSearchMaxDomains();
  const batch1 = ordered.slice(0, max);
  const batch2 = ordered.slice(max, max * 2);
  return { batch1, batch2, catalogueSize: ordered.length };
}

export async function getRecommendationTierPools(): Promise<{
  tier1: string[];
  tier2: string[];
  catalogueSize: number;
}> {
  const { batch1, batch2, catalogueSize } =
    await getFastRecommendationBatches();
  return {
    tier1: batch1,
    tier2: batch2,
    catalogueSize,
  };
}

export function buildRecommendationFqdns(
  name: string,
  anchorDomain: string,
  tldPool: string[],
): string[] {
  const anchor = anchorDomain.toLowerCase();
  return tldPool
    .map((tld) => `${name}${tld}`.toLowerCase())
    .filter((fqdn) => fqdn !== anchor);
}

export function filterRegisterableRecommendations(
  results: DomainResult[],
): DomainResult[] {
  return results.filter((result) => {
    if (result.status === "available") return true;
    if (result.status === "premium" && result.register != null) return true;
    return false;
  });
}

export function topRegisterableRecommendations(
  results: DomainResult[],
  limit = customerAlternativeLimit(),
): DomainResult[] {
  return sortRecommendationResults(
    filterRegisterableRecommendations(results),
  ).slice(0, limit);
}
