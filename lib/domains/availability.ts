import { PRICE_BY_TLD, splitDomain } from "@/lib/domains/tlds";

export type DomainStatus = "available" | "taken" | "premium" | "invalid";

export type DomainResult = {
  domain: string;
  name: string;
  tld: string;
  status: DomainStatus;
  register: number | null;
  renew: number | null;
  transfer: number | null;
  message?: string;
};

/** Names that are always shown as registered so results stay believable. */
const RESERVED = new Set([
  "google",
  "facebook",
  "amazon",
  "apple",
  "microsoft",
  "hosting",
  "domain",
  "mail",
  "shop",
  "store",
  "cloud",
  "ai",
  "app",
  "web",
  "site",
  "blog",
  "news",
  "test",
  "hostingbeyond",
]);

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Deterministic availability so the same search always returns the same
 * answer. Swap this for a registrar/EPP lookup by setting DOMAIN_LOOKUP_URL.
 */
export function checkDomain(input: string, fallbackTld = ".com"): DomainResult {
  const { name, tld: parsedTld } = splitDomain(input);
  const tld = parsedTld || fallbackTld;
  const domain = `${name}${tld}`;
  const price = PRICE_BY_TLD.get(tld);

  if (!name || name.length < 2 || name.length > 63 || name.startsWith("-")) {
    return {
      domain,
      name,
      tld,
      status: "invalid",
      register: null,
      renew: null,
      transfer: null,
      message: "Use 2–63 letters, numbers or hyphens.",
    };
  }

  if (!price) {
    return {
      domain,
      name,
      tld,
      status: "invalid",
      register: null,
      renew: null,
      transfer: null,
      message: `We do not sell ${tld} yet — try another extension.`,
    };
  }

  const seed = hash(domain);
  const taken = RESERVED.has(name) || name.length <= 3 || seed % 100 < 34;
  const premium = !taken && seed % 100 >= 92;

  if (taken) {
    return {
      domain,
      name,
      tld,
      status: "taken",
      register: null,
      renew: null,
      transfer: price.transfer,
      message: "Already registered — transfer it or try another extension.",
    };
  }

  return {
    domain,
    name,
    tld,
    status: premium ? "premium" : "available",
    register: premium
      ? Math.round(price.register * 24 + (seed % 40)) + 0.99
      : price.register,
    renew: price.renew,
    transfer: price.transfer,
  };
}

export function checkDomains(inputs: string[], fallbackTld = ".com") {
  const seen = new Set<string>();
  const results: DomainResult[] = [];
  for (const input of inputs) {
    const result = checkDomain(input, fallbackTld);
    if (seen.has(result.domain)) continue;
    seen.add(result.domain);
    results.push(result);
  }
  return results;
}

/** Parses a bulk textarea (one domain per line, commas or spaces allowed). */
export function parseBulkInput(value: string, limit = 50) {
  return value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}
