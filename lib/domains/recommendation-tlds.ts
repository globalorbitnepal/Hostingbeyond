import { PRICE_BY_TLD, TLD_PRICES } from "@/lib/domains/tlds";
import { listRetailTldPrices } from "@/lib/domains/pricing-engine";

/** Ranking preference only — availability is always from the live provider. */
export const RECOMMENDATION_TLD_TIERS: string[][] = [
  [".com", ".net", ".org", ".co", ".io"],
  [".ai", ".app", ".dev", ".tech", ".cloud", ".me", ".chat", ".studio"],
  [
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
for (let tier = 0; tier < RECOMMENDATION_TLD_TIERS.length; tier++) {
  for (const tld of RECOMMENDATION_TLD_TIERS[tier]) {
    TIER_INDEX.set(tld.toLowerCase(), tier);
  }
}

export function recommendationTierIndex(tld: string): number {
  const key = tld.startsWith(".") ? tld.toLowerCase() : `.${tld.toLowerCase()}`;
  return TIER_INDEX.get(key) ?? 99;
}

export function sortByRecommendationPriority(a: string, b: string): number {
  const ia = recommendationTierIndex(a);
  const ib = recommendationTierIndex(b);
  if (ia !== ib) return ia - ib;
  return a.localeCompare(b);
}

function poolSizeLimit(): number {
  const raw = Number(process.env.DOMAIN_RECOMMENDATION_TLD_POOL_SIZE ?? 36);
  if (!Number.isFinite(raw) || raw < 10) return 36;
  return Math.min(Math.max(raw, 10), 80);
}

export function recommendationResultLimit(): number {
  const raw = Number(process.env.DOMAIN_RECOMMENDATION_RESULT_LIMIT ?? 12);
  if (!Number.isFinite(raw) || raw < 1) return 12;
  return Math.min(Math.max(raw, 1), 30);
}

/** Enabled catalogue TLDs for recommendation discovery (HostingBeyond retail). */
export async function getRecommendationTldPool(): Promise<string[]> {
  const rows = await listRetailTldPrices();
  const enabled = new Set(
    rows.filter((r) => r.enabled).map((r) => r.tld.toLowerCase()),
  );
  for (const row of TLD_PRICES) {
    enabled.add(row.tld.toLowerCase());
  }

  const ordered: string[] = [];
  const seen = new Set<string>();
  for (const tier of RECOMMENDATION_TLD_TIERS) {
    for (const tld of tier) {
      const key = tld.toLowerCase();
      if (!enabled.has(key) && !PRICE_BY_TLD.has(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(key);
    }
  }
  for (const key of [...enabled].sort()) {
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(key);
  }

  return ordered.slice(0, poolSizeLimit());
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
