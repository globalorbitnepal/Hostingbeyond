/**
 * Authoritative public country list for the storefront selector.
 *
 * Specified 2026-10-29 for the Hostinger-style dropdown (USA default).
 * Not derived from website languages. Not the ISO-wide `config/geo` catalog.
 */
export const STOREFRONT_COUNTRY_CODES = [
  "AU",
  "BD",
  "BR",
  "CA",
  "CN",
  "DE",
  "ES",
  "FR",
  "GB",
  "IN",
  "JP",
  "NP",
  "RU",
  "US",
] as const;

export type StorefrontCountryCode = (typeof STOREFRONT_COUNTRY_CODES)[number];

export type StorefrontCountry = {
  code: StorefrontCountryCode;
  name: string;
};

/** English names as requested. Alphabetical like the approved Hostinger menu. */
export const STOREFRONT_COUNTRIES: readonly StorefrontCountry[] = [
  { code: "AU", name: "Australia" },
  { code: "BD", name: "Bangladesh" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "NP", name: "Nepal" },
  { code: "RU", name: "Russia" },
  { code: "ES", name: "Spain" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

const FORBIDDEN_IN_SELECTOR = [
  "AR",
  "AF",
  "IT",
  "MX",
  "KR",
  "ID",
  "NL",
  "AE",
  "PK",
] as const;

export function isStorefrontCountryCode(
  value: unknown,
): value is StorefrontCountryCode {
  return (
    typeof value === "string" &&
    (STOREFRONT_COUNTRY_CODES as readonly string[]).includes(value)
  );
}

export function storefrontCountrySearchText(
  country: StorefrontCountry,
): string {
  return `${country.name} ${country.code}`.toLowerCase();
}

export function searchStorefrontCountries(query: string): StorefrontCountry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...STOREFRONT_COUNTRIES];
  return STOREFRONT_COUNTRIES.filter((country) =>
    storefrontCountrySearchText(country).includes(q),
  );
}

export function assertNoObsoleteStorefrontCountries(
  codes: readonly string[],
): void {
  for (const code of FORBIDDEN_IN_SELECTOR) {
    if (codes.includes(code)) {
      throw new Error(
        `obsolete country ${code} must not appear in the selector`,
      );
    }
  }
}
