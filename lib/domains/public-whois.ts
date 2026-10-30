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
  const url = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/rdap+json, application/json",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) {
      return { error: "No public WHOIS record was found for this domain." };
    }
    if (!res.ok) {
      return { error: "WHOIS details are unavailable right now." };
    }
    const json: unknown = await res.json();
    return parseRdapDomain(json, domain);
  } catch {
    return { error: "WHOIS details are unavailable right now." };
  }
}
