import { normalizeDomainSearchInput } from "@/lib/domains/normalize";

/** Public WHOIS lookup page on whois.com for a registered name. */
export function whoisComLookupUrl(domain: string): string | null {
  const parsed = normalizeDomainSearchInput(domain);
  if (!parsed.ok || !parsed.tld) return null;
  return `https://www.whois.com/whois/${encodeURIComponent(parsed.query.toLowerCase())}`;
}
