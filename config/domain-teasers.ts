/**
 * Fallback domain extension teasers for the hero search bar.
 * Live values come from Orbit CMS (`hero.domainPricing`) when available.
 */
export const heroDomainTeasers = [
  { tld: ".com", priceLabel: "$7.99/yr", usd: 7.99 },
  { tld: ".net", priceLabel: "$6.99/yr", usd: 6.99 },
  { tld: ".org", priceLabel: "$5.99/yr", usd: 5.99 },
  { tld: ".dev", priceLabel: "$3.99/yr", usd: 3.99 },
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
