/**
 * Fallback domain extension teasers for the hero search bar.
 * Live values come from Orbit CMS (`hero.domainPricing`) when available.
 */
export const heroDomainTeasers = [
  { tld: ".com", priceLabel: "$9.99/yr", usd: 9.99, originalUsd: 17.99 },
  { tld: ".net", priceLabel: "$11.99/yr", usd: 11.99, originalUsd: 17.49 },
  { tld: ".org", priceLabel: "$7.99/yr", usd: 7.99, originalUsd: 17.99 },
  { tld: ".online", priceLabel: "$2.99/yr", usd: 2.99, originalUsd: 49.99 },
  { tld: ".shop", priceLabel: "$2.99/yr", usd: 2.99, originalUsd: 49.99 },
] as const;

export const heroTldOptions = [
  ".com",
  ".net",
  ".org",
  ".co",
  ".dev",
  ".io",
  ".ai",
] as const;
