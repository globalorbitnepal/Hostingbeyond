import type { DomainResult } from "@/lib/domains/availability";
import {
  GLOBAL_ALTERNATIVE_TLD_ORDER,
  mergeTldPriorityOrder,
  normalizeCountryCode,
} from "@/lib/domains/customer-tld-priority";
import { getTldCatalogueSnapshot } from "@/lib/domains/tld-catalogue-cache";
import {
  PRIORITY_TLD_TIERS,
  recommendationTierIndex,
  sortByRecommendationPriority,
} from "@/lib/domains/recommendation-priority";

export {
  PRIORITY_TLD_TIERS,
  recommendationTierIndex,
  sortByRecommendationPriority,
} from "@/lib/domains/recommendation-priority";

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
  const raw = Number(process.env.DOMAIN_CUSTOMER_ALTERNATIVE_LIMIT ?? 14);
  if (!Number.isFinite(raw) || raw < 1) return 14;
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

/** Global alternative order (local country TLDs are prepended at runtime). */
export const FAST_CUSTOMER_TLD_ORDER: string[] = GLOBAL_ALTERNATIVE_TLD_ORDER;

export function fastPoolMaxTlds(): number {
  const raw = Number(process.env.DOMAIN_FAST_POOL_TLDS ?? 14);
  if (!Number.isFinite(raw) || raw < 7) return 14;
  return Math.min(Math.max(raw, 7), 24);
}

/** First LIVE bulk chunk — keep small for faster DNA response; tier 2 covers the rest. */
export function fastChunk1TldCount(): number {
  const raw = Number(process.env.DOMAIN_FAST_CHUNK1_TLDS ?? 7);
  if (!Number.isFinite(raw) || raw < 4) return 7;
  return Math.min(Math.max(raw, 4), 24);
}

/**
 * Split one alternative batch into smaller provider requests (0 = single bulk only).
 * Tune with measurements — smaller parallel bulks can beat one large DNA payload.
 */
export function alternativeProviderSubChunkSize(): number {
  const raw = Number(process.env.DOMAIN_ALT_SUB_CHUNK_SIZE ?? 0);
  if (!Number.isFinite(raw) || raw < 2) return 0;
  return Math.min(Math.max(raw, 2), 12);
}

/** Max concurrent provider sub-chunks per alternative batch (capped at 2). */
export function alternativeProviderParallelLimit(): number {
  const raw = Number(process.env.DOMAIN_ALT_PROVIDER_PARALLEL ?? 1);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(Math.max(raw, 1), 2);
}

/** Split chunk-1 TLD pool into two progressive UI/provider waves. */
export function splitAlternativeTldWaves(tlds: string[]): [string[], string[]] {
  if (tlds.length < 2) return [tlds, []];
  const mid = Math.ceil(tlds.length / 2);
  return [tlds.slice(0, mid), tlds.slice(mid)];
}

export async function getFastCustomerTldPoolChunk(
  chunk: 1 | 2,
  countryCode?: string | null,
): Promise<string[]> {
  const pool = await getFastCustomerTldPool(countryCode);
  const split = fastChunk1TldCount();
  if (chunk === 1) return pool.slice(0, split);
  return pool.slice(split, fastPoolMaxTlds());
}

let memoryFastPool: string[] | null = null;
let memoryFastPoolCountry: string | null = null;
let memoryFastPoolLoadedAt = 0;

/** Clear in-memory fast pool (experiments / catalogue refresh). */
export function invalidateFastTldPoolCache(): void {
  memoryFastPool = null;
  memoryFastPoolCountry = null;
  memoryFastPoolLoadedAt = 0;
}

export async function getFastCustomerTldPool(
  countryCode?: string | null,
): Promise<string[]> {
  const countryKey = normalizeCountryCode(countryCode) ?? "GLOBAL";
  const ttl = 4 * 60 * 60 * 1000;
  if (
    memoryFastPool &&
    memoryFastPoolCountry === countryKey &&
    Date.now() - memoryFastPoolLoadedAt < ttl
  ) {
    return memoryFastPool;
  }
  const searchable = new Set(await getSearchableTldCatalogue());
  const picked = mergeTldPriorityOrder(
    countryKey === "GLOBAL" ? null : countryKey,
    searchable,
  );
  const capped = picked.slice(0, fastPoolMaxTlds());
  memoryFastPool = capped;
  memoryFastPoolCountry = countryKey;
  memoryFastPoolLoadedAt = Date.now();
  return capped;
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
    const { lookupDomainNames } = await import("@/lib/domains/lookup");
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
