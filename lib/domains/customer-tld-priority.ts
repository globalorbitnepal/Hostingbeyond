/**
 * Customer-facing alternative TLD ordering (catalogue-intersected at runtime).
 * Browser language is not used — only explicit country (cookie / search body).
 */

/** Global priority after the anchor (.com or customer-entered TLD). */
export const GLOBAL_ALTERNATIVE_TLD_ORDER: string[] = [
  ".in",
  ".org",
  ".pro",
  ".net",
  ".dev",
  ".online",
  ".app",
  ".ai",
  ".info",
  ".io",
  ".co",
  ".tech",
  ".cloud",
  ".shop",
  ".store",
  ".site",
  ".website",
  ".digital",
  ".blog",
  ".studio",
  ".chat",
  ".fun",
  ".me",
  ".cc",
  ".biz",
];

/**
 * Country-specific extensions to try near the top (only if present in provider catalogue).
 * Order: more specific first (e.g. .com.np before .np).
 */
export const LOCAL_TLD_CANDIDATES_BY_COUNTRY: Record<string, string[]> = {
  NP: [".com.np", ".np"],
  IN: [".in"],
  US: [".us"],
  GB: [".uk", ".co.uk"],
  AU: [".au", ".com.au"],
  CA: [".ca"],
  DE: [".de"],
  FR: [".fr"],
  IT: [".it"],
  ES: [".es"],
  NL: [".nl"],
  JP: [".jp", ".co.jp"],
  KR: [".kr", ".co.kr"],
  SG: [".sg", ".com.sg"],
  AE: [".ae"],
  PK: [".pk"],
  BD: [".bd"],
  NZ: [".nz", ".co.nz"],
  ZA: [".co.za"],
  BR: [".com.br", ".br"],
  MX: [".mx"],
};

export function normalizeCountryCode(
  input: string | null | undefined,
): string | null {
  if (!input || typeof input !== "string") return null;
  const code = input.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return code;
}

export function localTldCandidatesForCountry(
  countryCode: string | null | undefined,
): string[] {
  const code = normalizeCountryCode(countryCode);
  if (!code) return [];
  return LOCAL_TLD_CANDIDATES_BY_COUNTRY[code] ?? [];
}

/** Merge local + global order without duplicates; lowercase keys. */
export function mergeTldPriorityOrder(
  countryCode: string | null | undefined,
  searchable: ReadonlySet<string>,
  excludeTlds: ReadonlySet<string> = new Set(),
): string[] {
  const local = localTldCandidatesForCountry(countryCode);
  const seen = new Set<string>();
  const picked: string[] = [];

  const tryAdd = (tld: string) => {
    const key = tld.startsWith(".")
      ? tld.toLowerCase()
      : `.${tld.toLowerCase()}`;
    if (seen.has(key) || excludeTlds.has(key) || !searchable.has(key)) return;
    seen.add(key);
    picked.push(key);
  };

  for (const tld of local) tryAdd(tld);
  for (const tld of GLOBAL_ALTERNATIVE_TLD_ORDER) tryAdd(tld);

  return picked;
}
