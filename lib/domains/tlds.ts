/**
 * Domain catalogue used by the search pages and the availability API.
 * Prices are USD per year and mirror current market rates: `register` is the
 * promotional first-year price, `renew` the standard rate after year one.
 */

export type TldCategory =
  "popular" | "business" | "technology" | "ecommerce" | "creative";

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
    { id: "popular", label: "Most popular" },
    { id: "business", label: "Business" },
    { id: "technology", label: "Technology" },
    { id: "ecommerce", label: "Online store" },
    { id: "creative", label: "Creative" },
    { id: "all", label: "All extensions" },
  ];

export const TLD_PRICES: TldPrice[] = [
  {
    tld: ".com",
    register: 0.01,
    renew: 19.99,
    transfer: 9.99,
    categories: ["popular", "business"],
    note: "The one everyone types first",
  },
  {
    tld: ".online",
    register: 0.99,
    renew: 35.99,
    transfer: 30.99,
    categories: ["popular", "ecommerce"],
    note: "Generic and universal",
  },
  {
    tld: ".shop",
    register: 0.99,
    renew: 39.99,
    transfer: 34.99,
    categories: ["ecommerce"],
    note: "Made for selling",
  },
  {
    tld: ".store",
    register: 0.99,
    renew: 54.99,
    transfer: 46.99,
    categories: ["ecommerce"],
  },
  {
    tld: ".site",
    register: 0.99,
    renew: 38.99,
    transfer: 32.99,
    categories: ["creative"],
  },
  {
    tld: ".space",
    register: 0.99,
    renew: 32.99,
    transfer: 27.99,
    categories: ["creative"],
  },
  {
    tld: ".cloud",
    register: 1.99,
    renew: 25.99,
    transfer: 21.99,
    categories: ["technology"],
  },
  {
    tld: ".xyz",
    register: 1.99,
    renew: 18.99,
    transfer: 14.99,
    categories: ["popular", "creative"],
  },
  {
    tld: ".icu",
    register: 1.99,
    renew: 15.99,
    transfer: 12.99,
    categories: ["creative"],
  },
  {
    tld: ".blog",
    register: 1.99,
    renew: 29.99,
    transfer: 24.99,
    categories: ["creative"],
  },
  {
    tld: ".pro",
    register: 2.99,
    renew: 31.99,
    transfer: 23.99,
    categories: ["business"],
  },
  {
    tld: ".info",
    register: 3.99,
    renew: 31.99,
    transfer: 25.99,
    categories: ["business"],
  },
  {
    tld: ".tech",
    register: 6.99,
    renew: 63.99,
    transfer: 53.99,
    categories: ["technology"],
  },
  {
    tld: ".me",
    register: 7.99,
    renew: 19.99,
    transfer: 15.99,
    categories: ["creative"],
  },
  {
    tld: ".org",
    register: 8.99,
    renew: 17.99,
    transfer: 12.99,
    categories: ["popular", "business"],
  },
  {
    tld: ".dev",
    register: 9.99,
    renew: 18.99,
    transfer: 14.99,
    categories: ["technology"],
    note: "HTTPS enforced by default",
  },
  {
    tld: ".net",
    register: 12.74,
    renew: 17.99,
    transfer: 14.99,
    categories: ["popular", "technology"],
  },
  {
    tld: ".co",
    register: 23.99,
    renew: 34.99,
    transfer: 23.99,
    categories: ["business", "popular"],
  },
  {
    tld: ".io",
    register: 31.99,
    renew: 74.99,
    transfer: 54.99,
    categories: ["technology"],
    note: "Loved by startups and SaaS",
  },
  {
    tld: ".ai",
    register: 89.99,
    renew: 109.99,
    transfer: 179.99,
    categories: ["technology"],
    note: "Two-year minimum term",
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

export const CHEAPEST_TLD = [...TLD_PRICES].sort(
  (a, b) => a.register - b.register,
)[0];

export function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

/** Discount shown as a badge, e.g. 95 for "Save 95%". */
export function savePercent(price: TldPrice) {
  if (price.renew <= 0 || price.register >= price.renew) return 0;
  return Math.round((1 - price.register / price.renew) * 100);
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
