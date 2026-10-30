import { normalizeDomainSearchInput } from "@/lib/domains/normalize";

export type PublicWhoisRecord = {
  domain: string;
  registeredOn: string | null;
  expiresOn: string | null;
  updatedOn: string | null;
  statuses: string[];
  nameServers: string[];
  registrar: string | null;
  registrarIanaId: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const iso = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : value.slice(0, 19);
}

function humanStatus(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function eventDate(events: unknown, actions: string[]): string | null {
  if (!Array.isArray(events)) return null;
  const wanted = new Set(actions.map((item) => item.toLowerCase()));
  for (const item of events) {
    const row = asRecord(item);
    if (!row) continue;
    const action = asString(row.eventAction)?.toLowerCase();
    if (!action || !wanted.has(action)) continue;
    return formatDate(asString(row.eventDate));
  }
  return null;
}

function vcardFn(entity: Record<string, unknown>): string | null {
  const vcard = entity.vcardArray;
  if (!Array.isArray(vcard)) return null;
  const props = vcard[1];
  if (!Array.isArray(props)) return null;
  for (const prop of props) {
    if (!Array.isArray(prop) || prop[0] !== "fn") continue;
    return asString(prop[3]);
  }
  return null;
}

function registrarFromEntities(entities: unknown): {
  registrar: string | null;
  registrarIanaId: string | null;
} {
  if (!Array.isArray(entities)) {
    return { registrar: null, registrarIanaId: null };
  }
  for (const item of entities) {
    const row = asRecord(item);
    if (!row) continue;
    const roles = Array.isArray(row.roles)
      ? row.roles.map((role) => String(role).toLowerCase())
      : [];
    if (!roles.includes("registrar")) continue;
    let registrarIanaId: string | null = null;
    if (Array.isArray(row.publicIds)) {
      for (const id of row.publicIds) {
        const pub = asRecord(id);
        if (!pub) continue;
        const type = asString(pub.type)?.toLowerCase() ?? "";
        if (type.includes("iana")) {
          registrarIanaId = asString(pub.identifier);
          break;
        }
      }
    }
    return {
      registrar: vcardFn(row) ?? asString(row.handle),
      registrarIanaId,
    };
  }
  return { registrar: null, registrarIanaId: null };
}

function nameServersFrom(payload: Record<string, unknown>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const list = Array.isArray(payload.nameservers) ? payload.nameservers : [];
  for (const item of list) {
    const row = asRecord(item);
    const host = (
      asString(row?.ldhName) ??
      asString(row?.unicodeName) ??
      ""
    ).toLowerCase();
    if (!host || seen.has(host)) continue;
    seen.add(host);
    out.push(host);
  }
  return out;
}

/** Maps a registry RDAP document to customer-safe WHOIS fields. No URLs. */
export function parseRdapDomain(
  payload: unknown,
  fallbackDomain: string,
): PublicWhoisRecord {
  const row = asRecord(payload);
  const domain =
    asString(row?.ldhName)?.toLowerCase() ??
    asString(row?.unicodeName)?.toLowerCase() ??
    fallbackDomain.toLowerCase();
  const statuses = Array.isArray(row?.status)
    ? row.status
        .map((item) => humanStatus(String(item)))
        .filter((item) => item.length > 0)
    : [];
  const registrar = registrarFromEntities(row?.entities);
  return {
    domain,
    registeredOn: eventDate(row?.events, ["registration"]),
    expiresOn: eventDate(row?.events, ["expiration"]),
    updatedOn: eventDate(row?.events, [
      "last changed",
      "last update of rdap database",
    ]),
    statuses,
    nameServers: row ? nameServersFrom(row) : [],
    registrar: registrar.registrar,
    registrarIanaId: registrar.registrarIanaId,
  };
}

const RDAP_HEADERS = {
  Accept: "application/rdap+json, application/json",
  "User-Agent":
    "Mozilla/5.0 (compatible; HostingBeyond/1.0; +https://hosting.theglobalorbit.com)",
} as const;

const TLD_RDAP_FALLBACK: Record<string, string[]> = {
  com: ["https://rdap.verisign.com/com/v1/"],
  net: ["https://rdap.verisign.com/net/v1/"],
  org: ["https://rdap.publicinterestregistry.org/rdap/"],
  info: ["https://rdap.identitydigital.services/rdap/"],
  io: ["https://rdap.nic.io/"],
  ai: ["https://rdap.identitydigital.services/rdap/"],
  co: ["https://rdap.nic.co/"],
  app: ["https://pubapi.registry.google/rdap/"],
  dev: ["https://pubapi.registry.google/rdap/"],
  xyz: ["https://rdap.centralnic.com/xyz/"],
};

type IanaRdapBootstrap = {
  services?: Array<[string[], string[]]>;
};

let bootstrapCache: { at: number; data: IanaRdapBootstrap | null } = {
  at: 0,
  data: null,
};

function tldOf(domain: string): string {
  const parts = domain.split(".").filter(Boolean);
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

function joinRdapUrl(base: string, domain: string): string {
  const trimmed = base.trim();
  const withSlash = trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
  return `${withSlash}domain/${encodeURIComponent(domain)}`;
}

export function rdapLookupUrls(
  domain: string,
  bootstrap: IanaRdapBootstrap | null,
): string[] {
  const tld = tldOf(domain);
  const urls: string[] = [];
  const seen = new Set<string>();
  const push = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  const services = bootstrap?.services;
  if (Array.isArray(services)) {
    for (const entry of services) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const tlds = entry[0];
      const bases = entry[1];
      if (!Array.isArray(tlds) || !tlds.includes(tld)) continue;
      if (!Array.isArray(bases)) continue;
      for (const base of bases) {
        if (typeof base === "string") push(joinRdapUrl(base, domain));
      }
    }
  }

  for (const base of TLD_RDAP_FALLBACK[tld] ?? []) {
    push(joinRdapUrl(base, domain));
  }
  push(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
  return urls;
}

async function loadIanaBootstrap(): Promise<IanaRdapBootstrap | null> {
  const now = Date.now();
  if (bootstrapCache.data && now - bootstrapCache.at < 24 * 60 * 60 * 1000) {
    return bootstrapCache.data;
  }
  try {
    const res = await fetch("https://data.iana.org/rdap/dns.json", {
      headers: RDAP_HEADERS,
      cache: "force-cache",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return bootstrapCache.data;
    const data = (await res.json()) as IanaRdapBootstrap;
    bootstrapCache = { at: now, data };
    return data;
  } catch {
    return bootstrapCache.data;
  }
}

function isRdapDomainDocument(payload: unknown): boolean {
  const row = asRecord(payload);
  if (!row) return false;
  if (row.errorCode != null) return false;
  return Boolean(
    asString(row.ldhName) ||
    asString(row.unicodeName) ||
    row.objectClassName === "domain",
  );
}

async function fetchRdapJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: RDAP_HEADERS,
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 404) return { errorCode: 404 };
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/json|rdap/i.test(type) && !type.includes("javascript")) {
      const text = await res.text();
      if (text.trimStart().startsWith("<")) return null;
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return null;
      }
    }
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

export async function lookupPublicWhois(
  domainRaw: string,
): Promise<PublicWhoisRecord | { error: string }> {
  const parsed = normalizeDomainSearchInput(domainRaw);
  if (!parsed.ok || !parsed.tld) {
    return {
      error: parsed.ok ? "Please enter a valid domain name." : parsed.error,
    };
  }
  const domain = parsed.query.toLowerCase();
  const bootstrap = await loadIanaBootstrap();
  const urls = rdapLookupUrls(domain, bootstrap);
  let notFound = false;

  for (const url of urls.slice(0, 4)) {
    const json = await fetchRdapJson(url);
    if (!json) continue;
    const row = asRecord(json);
    if (row?.errorCode === 404 || row?.errorCode === "404") {
      notFound = true;
      continue;
    }
    if (!isRdapDomainDocument(json)) continue;
    return parseRdapDomain(json, domain);
  }

  if (notFound) {
    return { error: "No public WHOIS record was found for this domain." };
  }
  return { error: "WHOIS details are unavailable right now." };
}
