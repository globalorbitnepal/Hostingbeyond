/**
 * Domain catalogue used by the domain search page and the search API.
 * Prices are USD per year. `register` is the first-year promo price.
 */

export type TldCategory =
  "popular" | "business" | "tech" | "ecommerce" | "creative";

export type TldPrice = {
  tld: string;
  register: number;
  renew: number;
  transfer: number;
  categories: TldCategory[];
  note?: string;
};

export const TLD_CATEGORIES: Array<{ id: TldCategory | "all"; label: string }> =
  [
    { id: "all", label: "All extensions" },
    { id: "popular", label: "Most popular" },
    { id: "business", label: "Business" },
    { id: "tech", label: "Tech & AI" },
    { id: "ecommerce", label: "Online store" },
    { id: "creative", label: "Creative" },
  ];

export const TLD_PRICES: TldPrice[] = [
  {
    tld: ".com",
    register: 7.99,
    renew: 15.99,
    transfer: 12.99,
    categories: ["popular", "business"],
    note: "The one everyone types first",
  },
  {
    tld: ".net",
    register: 6.99,
    renew: 17.99,
    transfer: 14.99,
    categories: ["popular", "tech"],
  },
  {
    tld: ".org",
    register: 5.99,
    renew: 14.99,
    transfer: 11.99,
    categories: ["popular", "business"],
  },
  {
    tld: ".io",
    register: 34.99,
    renew: 54.99,
    transfer: 49.99,
    categories: ["tech"],
    note: "Loved by startups and SaaS",
  },
  {
    tld: ".ai",
    register: 69.99,
    renew: 99.99,
    transfer: 89.99,
    categories: ["tech"],
  },
  {
    tld: ".dev",
    register: 3.99,
    renew: 14.99,
    transfer: 12.99,
    categories: ["popular", "tech"],
    note: "HTTPS enforced by default",
  },
  {
    tld: ".app",
    register: 9.99,
    renew: 19.99,
    transfer: 17.99,
    categories: ["tech"],
  },
  {
    tld: ".cloud",
    register: 3.99,
    renew: 19.99,
    transfer: 17.99,
    categories: ["tech"],
  },
  {
    tld: ".co",
    register: 9.99,
    renew: 29.99,
    transfer: 26.99,
    categories: ["popular", "business"],
  },
  {
    tld: ".biz",
    register: 5.99,
    renew: 21.99,
    transfer: 18.99,
    categories: ["business"],
  },
  {
    tld: ".info",
    register: 3.99,
    renew: 24.99,
    transfer: 19.99,
    categories: ["business"],
  },
  {
    tld: ".agency",
    register: 6.99,
    renew: 29.99,
    transfer: 26.99,
    categories: ["business"],
  },
  {
    tld: ".store",
    register: 1.99,
    renew: 39.99,
    transfer: 34.99,
    categories: ["ecommerce"],
    note: "Best value first year",
  },
  {
    tld: ".shop",
    register: 1.99,
    renew: 35.99,
    transfer: 31.99,
    categories: ["ecommerce"],
  },
  {
    tld: ".online",
    register: 1.49,
    renew: 34.99,
    transfer: 29.99,
    categories: ["ecommerce", "popular"],
  },
  {
    tld: ".site",
    register: 1.49,
    renew: 32.99,
    transfer: 28.99,
    categories: ["creative"],
  },
  {
    tld: ".xyz",
    register: 1.29,
    renew: 13.99,
    transfer: 11.99,
    categories: ["creative", "popular"],
  },
  {
    tld: ".blog",
    register: 4.99,
    renew: 29.99,
    transfer: 26.99,
    categories: ["creative"],
  },
  {
    tld: ".design",
    register: 9.99,
    renew: 49.99,
    transfer: 44.99,
    categories: ["creative"],
  },
  {
    tld: ".me",
    register: 4.99,
    renew: 24.99,
    transfer: 21.99,
    categories: ["creative"],
  },
  {
    tld: ".tech",
    register: 4.99,
    renew: 49.99,
    transfer: 44.99,
    categories: ["tech"],
  },
  {
    tld: ".studio",
    register: 8.99,
    renew: 32.99,
    transfer: 29.99,
    categories: ["creative"],
  },
];

/** Extensions checked automatically for every single-domain search. */
export const SUGGESTED_TLDS = [
  ".com",
  ".net",
  ".org",
  ".io",
  ".dev",
  ".co",
  ".store",
  ".online",
  ".ai",
  ".xyz",
];

export const PRICE_BY_TLD = new Map(TLD_PRICES.map((item) => [item.tld, item]));

export function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

/** Splits "myshop.com" into its name and extension parts. */
export function splitDomain(input: string) {
  const clean = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  const match = clean.match(/^([a-z0-9-]+)((?:\.[a-z]{2,})+)?$/);
  if (!match) return { name: clean.replace(/[^a-z0-9-]/g, ""), tld: "" };
  return { name: match[1] ?? "", tld: match[2] ?? "" };
}
