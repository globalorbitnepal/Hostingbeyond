/** Client-safe TLD ranking (no server/provider imports). */

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
