/**
 * Fallback domain extension teasers for the hero search bar.
 * Live values come from Orbit CMS (`hero.domainPricing`) when available.
 */
export const heroDomainTeasers = [
  { tld: ".com", priceLabel: "$7.99/yr" },
  { tld: ".net", priceLabel: "$6.99/yr" },
  { tld: ".org", priceLabel: "$5.99/yr" },
  { tld: ".dev", priceLabel: "$3.99/yr" },
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
