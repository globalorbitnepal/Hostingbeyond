import type { DomainResult } from "@/lib/domains/availability";
import { lookupDomainNames } from "@/lib/domains/lookup";
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

/** TLDs per provider availability chunk (LIVE DNA 403 above ~25 names per request). */
export function recommendationChunkSize(): number {
  const raw = Number(process.env.DOMAIN_RECOMMENDATION_CHUNK_SIZE ?? 12);
  if (!Number.isFinite(raw) || raw < 5) return 12;
  return Math.min(Math.max(raw, 5), 25);
}

export function recommendationResultLimit(): number {
  return customerAlternativeLimit();
}

/** Highest-probability extensions for instant customer search (catalogue-intersected). */
export const FAST_CUSTOMER_TLD_ORDER: string[] = [
  ".net",
  ".org",
  ".in",
  ".ai",
  ".io",
  ".app",
  ".dev",
  ".shop",
  ".store",
  ".online",
  ".website",
  ".digital",
  ".tech",
  ".cloud",
  ".site",
  ".blog",
  ".agency",
  ".studio",
  ".chat",
  ".fun",
  ".co",
  ".cc",
  ".me",
];

export function fastPoolMaxTlds(): number {
  const raw = Number(process.env.DOMAIN_FAST_POOL_TLDS ?? 18);
  if (!Number.isFinite(raw) || raw < 5) return 18;
  return Math.min(Math.max(raw, 5), 24);
}

export async function getFastCustomerTldPool(): Promise<string[]> {
  const searchable = new Set(await getSearchableTldCatalogue());
  const picked: string[] = [];
  for (const tld of FAST_CUSTOMER_TLD_ORDER) {
    const key = tld.toLowerCase();
    if (!searchable.has(key)) continue;
    picked.push(key);
    if (picked.length >= fastPoolMaxTlds()) break;
  }
  return picked;
}

export async function getDeepDiscoveryTldPool(): Promise<string[]> {
  const full = await getSearchableTldCatalogue();
  const fast = new Set(await getFastCustomerTldPool());
  const raw = Number(process.env.DOMAIN_DEEP_POOL_TLDS ?? 24);
  const max = Math.min(Math.max(Number.isFinite(raw) ? raw : 24, 5), 25);
  return full.filter((t) => t !== ".com" && !fast.has(t)).slice(0, max);
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

/** Check ranked TLDs in small provider chunks; stop once enough registerable results exist. */
export async function collectTopRecommendations(
  name: string,
  anchorDomain: string,
  query: string,
  tldPool: string[],
  existing: DomainResult[] = [],
): Promise<{
  recommendations: DomainResult[];
  extensionsChecked: number;
  scannedEntirePool: boolean;
  providerChunks: number;
}> {
  const limit = customerAlternativeLimit();
  const chunk = recommendationChunkSize();
  let merged = [...existing];
  let extensionsChecked = 0;
  let providerChunks = 0;
  let scannedEntirePool = tldPool.length === 0;

  for (let i = 0; i < tldPool.length; i += chunk) {
    const tldSlice = tldPool.slice(i, i + chunk);
    const fqdns = buildRecommendationFqdns(name, anchorDomain, tldSlice);
    if (!fqdns.length) {
      if (i + chunk >= tldPool.length) scannedEntirePool = true;
      continue;
    }
    providerChunks += 1;
    const lookup = await lookupDomainNames(fqdns, { query, tlds: tldSlice });
    merged = [...merged, ...lookup.results];
    extensionsChecked += fqdns.length;
    const top = topRegisterableRecommendations(merged);
    if (top.length >= limit) {
      return {
        recommendations: top,
        extensionsChecked,
        scannedEntirePool: i + chunk >= tldPool.length,
        providerChunks,
      };
    }
    if (i + chunk >= tldPool.length) {
      scannedEntirePool = true;
    }
  }

  return {
    recommendations: topRegisterableRecommendations(merged),
    extensionsChecked,
    scannedEntirePool,
    providerChunks,
  };
}
