const TLD =
  "com|net|org|io|co|in|np|dev|app|shop|online|store|xyz|info|biz|me|ai|site|cloud|tech|pro";

const FQDN = new RegExp(
  `\\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.(?:${TLD}))\\b`,
  "i",
);

const DOMAIN_HELP =
  /domain|register a name|tld|extension|whois|availability|डोमेन|डोमेन/;

const STOP = new Set([
  "a",
  "an",
  "and",
  "the",
  "my",
  "our",
  "new",
  "good",
  "best",
  "domain",
  "domains",
  "name",
  "names",
  "help",
  "me",
  "please",
  "find",
  "register",
  "search",
  "check",
  "available",
  "availability",
  "for",
  "with",
  "this",
  "that",
]);

export function wantsDomainHelp(message: string): boolean {
  return DOMAIN_HELP.test(message.toLowerCase()) || FQDN.test(message);
}

export function extractDomainQuery(message: string): string | null {
  const text = message.trim();
  if (!text) return null;
  const fqdn = text.match(FQDN);
  if (fqdn?.[1]) return fqdn[1].toLowerCase();
  if (!DOMAIN_HELP.test(text.toLowerCase())) return null;
  const quoted = text.match(/["“']([a-z0-9][a-z0-9.-]{1,80})["”']/i);
  if (quoted?.[1]) return quoted[1].toLowerCase();
  const named = text.match(
    /(?:search|find|register|check|for|called|named)\s+(?:a\s+)?(?:domain\s+)?(?:called\s+|named\s+)?([a-z0-9][a-z0-9-]{1,62})/i,
  );
  const token = named?.[1]?.toLowerCase();
  if (token && token.length >= 3 && !STOP.has(token) && !/^\d+$/.test(token)) {
    return token;
  }
  return null;
}
