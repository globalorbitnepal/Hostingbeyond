import type { DomainResult } from "@/lib/domains/availability";
import { getTldCatalogueSnapshot } from "@/lib/domains/tld-catalogue-cache";

/** Ranking preference only — never implies availability. */
export const PRIORITY_TLD_TIERS: string[][] = [
  [".com", ".net", ".org", ".co", ".io"],
  [".ai", ".app", ".dev", ".tech", ".me", ".cloud"],
  [".in", ".pk", ".uk", ".us", ".ca", ".au", ".de", ".fr"],
  [
    ".chat",
    ".studio",
    ".online",
    ".site",
    ".store",
    ".blog",
    ".fun",
    ".cc",
    ".xyz",
    ".info",
    ".shop",
    ".space",
    ".pro",
    ".icu",
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

function tier1SizeLimit(): number {
  const raw = Number(process.env.DOMAIN_RECOMMENDATION_TIER1_SIZE ?? 36);
  if (!Number.isFinite(raw) || raw < 5) return 36;
  return Math.min(Math.max(raw, 5), 80);
}

function tier2SizeLimit(): number {
  const raw = Number(process.env.DOMAIN_RECOMMENDATION_TIER2_SIZE ?? 80);
  if (!Number.isFinite(raw) || raw < 0) return 80;
  return Math.min(Math.max(raw, 0), 120);
}

export function recommendationResultLimit(): number {
  const raw = Number(process.env.DOMAIN_RECOMMENDATION_RESULT_LIMIT ?? 24);
  if (!Number.isFinite(raw) || raw < 1) return 24;
  return Math.min(Math.max(raw, 1), 50);
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

export async function getRecommendationTierPools(): Promise<{
  tier1: string[];
  tier2: string[];
  catalogueSize: number;
}> {
  const ordered = await getSearchableTldCatalogue();
  const t1 = ordered.slice(0, tier1SizeLimit());
  const t1Set = new Set(t1);
  const t2 = ordered
    .filter((tld) => !t1Set.has(tld))
    .slice(0, tier2SizeLimit());

  const snap = await getTldCatalogueSnapshot();
  return {
    tier1: t1,
    tier2: t2,
    catalogueSize: snap.searchable.length,
  };
}

/** @deprecated use getRecommendationTierPools */
export async function getRecommendationTldPool(): Promise<string[]> {
  const { tier1, tier2 } = await getRecommendationTierPools();
  return [...tier1, ...tier2];
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
