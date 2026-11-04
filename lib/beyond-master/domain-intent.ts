const TLD =
  "com|net|org|io|co|in|np|dev|app|shop|online|store|xyz|info|biz|me|ai|site|cloud|tech|pro";

const FQDN = new RegExp(
  `\\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.(?:${TLD}))\\b`,
  "i",
);

const DOMAIN_HELP =
  /domain|register a name|tld|extension|whois|availability|डोमेन|डोमेन|नाम दर्ता|नाम दर्ता|डोमेन दर्ता/;

const BULK =
  /bulk|multiple domain|many domain|एक साथ|बल्क|धेरै डोमेन|बहुत सारे डोमेन/i;

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

const GREETING =
  /^(hi+|h+e+y+|h+e+l+o+|h+l+o+|hola|namaste|namaskar|नमस्ते|नमस्कार|हाइ|हेलो|नमस्कार)([!?.\s]*)$/i;

export function isAgentGreeting(message: string): boolean {
  const text = message.trim();
  if (!text || text.length > 24) return false;
  return GREETING.test(text);
}

export function wantsBulkDomainSearch(message: string): boolean {
  return BULK.test(message);
}

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
