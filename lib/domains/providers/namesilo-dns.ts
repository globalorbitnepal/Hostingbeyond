import type {
  ProviderDnsRecord,
  ProviderDnsRecordInput,
} from "@/lib/domains/providers/provider";

/** DNS types the panel can write. Kept explicit so we never forward junk. */
export const EDITABLE_DNS_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SRV",
] as const;

export type EditableDnsType = (typeof EDITABLE_DNS_TYPES)[number];

const TYPE_SET = new Set<string>(EDITABLE_DNS_TYPES);
const HOST_PATTERN = /^(\*|@|[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)$/i;
const HOST_LABELS =
  /^(\*\.)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;

export const DEFAULT_DNS_TTL = 3600;

export function isEditableDnsType(value: string): value is EditableDnsType {
  return TYPE_SET.has(value.toUpperCase());
}

/**
 * Normalise a host label from the UI into what the registrar expects.
 * `@`, `www`, `mail.eu`, `*.app` and full FQDNs that end with the zone
 * are all accepted; anything else (URLs, paths, spaces) is rejected.
 */
export function normalizeDnsHost(
  rawHost: string,
  zone: string,
): { ok: true; host: string } | { ok: false; error: string } {
  const trimmed = rawHost.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: "Enter a host such as @ or www." };
  if (trimmed === "@") return { ok: true, host: "@" };

  const zoneName = zone.trim().toLowerCase().replace(/\.$/, "");
  let host = trimmed.replace(/\.$/, "");

  if (host === zoneName) return { ok: true, host: "@" };
  if (host.endsWith(`.${zoneName}`)) {
    host = host.slice(0, -(zoneName.length + 1));
  }

  if (!host) return { ok: true, host: "@" };
  if (!HOST_LABELS.test(host) || host.length > 253) {
    return {
      ok: false,
      error: "Use a host name like www or shop, without https:// or slashes.",
    };
  }
  if (!HOST_PATTERN.test(host) && !host.includes(".")) {
    return { ok: false, error: "That host name is not valid." };
  }
  return { ok: true, host };
}

export function normalizeDnsTtl(
  raw: number | string | null | undefined,
): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return DEFAULT_DNS_TTL;
  if (value < 300) return 300;
  if (value > 86400) return 86400;
  return Math.round(value);
}

export function normalizeDnsPriority(
  type: string,
  raw: number | string | null | undefined,
): number {
  if (type.toUpperCase() !== "MX") return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return 10;
  if (value > 65535) return 65535;
  return Math.round(value);
}

const IPV4 =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const HOSTNAME = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/** Validate the value for the record type. Cheap, offline, no DNS lookups. */
export function validateDnsValue(
  type: string,
  rawValue: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = rawValue.trim();
  if (!value) return { ok: false, error: "Enter a record value." };
  if (value.length > 2000)
    return { ok: false, error: "That value is too long." };

  switch (type.toUpperCase()) {
    case "A":
      return IPV4.test(value)
        ? { ok: true, value }
        : { ok: false, error: "An A record needs an IPv4 address." };
    case "AAAA":
      return /^[0-9a-f:]+$/i.test(value) && value.includes(":")
        ? { ok: true, value }
        : { ok: false, error: "An AAAA record needs an IPv6 address." };
    case "CNAME":
    case "NS":
      return HOSTNAME.test(value.replace(/\.$/, ""))
        ? { ok: true, value: value.replace(/\.$/, "") }
        : { ok: false, error: "Enter a hostname such as target.example.com." };
    case "MX":
      return HOSTNAME.test(value.replace(/\.$/, ""))
        ? { ok: true, value: value.replace(/\.$/, "") }
        : { ok: false, error: "An MX record needs a mail hostname." };
    case "TXT":
      return { ok: true, value };
    case "SRV":
      return /^\d+\s+\d+\s+\d+\s+\S+$/.test(value)
        ? { ok: true, value }
        : {
            ok: false,
            error: "SRV values look like: priority weight port target.",
          };
    default:
      return { ok: false, error: "That record type is not supported here." };
  }
}

export type DnsRecordFormInput = {
  type: string;
  host: string;
  value: string;
  ttl?: number | string | null;
  priority?: number | string | null;
};

/**
 * Narrow an untrusted JSON body into the record form shape.
 *
 * Route handlers receive `unknown`; this keeps the union honest so validation
 * (not TypeScript casts) decides whether the request is acceptable.
 */
export function parseDnsRecordBody(
  body: unknown,
): { ok: true; input: DnsRecordFormInput } | { ok: false } {
  if (!body || typeof body !== "object") return { ok: false };
  const row = body as Record<string, unknown>;
  const type = row.type;
  const host = row.host;
  const value = row.value;
  if (typeof type !== "string") return { ok: false };
  if (typeof host !== "string") return { ok: false };
  if (typeof value !== "string") return { ok: false };

  const ttl = row.ttl;
  const priority = row.priority;
  return {
    ok: true,
    input: {
      type,
      host,
      value,
      ttl: typeof ttl === "number" || typeof ttl === "string" ? ttl : undefined,
      priority:
        typeof priority === "number" || typeof priority === "string"
          ? priority
          : undefined,
    },
  };
}

export type ValidatedDnsRecord = ProviderDnsRecordInput;

export function validateDnsRecordInput(
  input: DnsRecordFormInput,
  zone: string,
): { ok: true; record: ValidatedDnsRecord } | { ok: false; error: string } {
  const type = input.type.trim().toUpperCase();
  if (!isEditableDnsType(type)) {
    return { ok: false, error: "Choose a supported record type." };
  }
  const host = normalizeDnsHost(input.host, zone);
  if (!host.ok) return { ok: false, error: host.error };
  const value = validateDnsValue(type, input.value);
  if (!value.ok) return { ok: false, error: value.error };

  return {
    ok: true,
    record: {
      type,
      host: host.host,
      value: value.value,
      ttl: normalizeDnsTtl(input.ttl),
      distance: normalizeDnsPriority(type, input.priority),
    },
  };
}

/**
 * Parse NameSilo `dnsListRecords` reply.
 *
 * The API returns either `resource_record` or `dns_records` and, on some
 * accounts, a single object for one record. Everything is coerced here so the
 * panel never renders `[object Object]`.
 */
export function parseNameSiloDnsRecords(
  reply: Record<string, unknown>,
): ProviderDnsRecord[] {
  const raw =
    reply.resource_record ??
    reply.dns_records ??
    reply.records ??
    reply.record ??
    [];
  const list = Array.isArray(raw) ? raw : [raw];
  const out: ProviderDnsRecord[] = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const recordId = row.record_id ?? row.recordId ?? row.id;
    const type = row.type ?? row.record_type;
    const host = row.host ?? row.name ?? row.hostname;
    if (recordId == null || type == null || host == null) continue;
    out.push({
      recordId: String(recordId),
      type: String(type).toUpperCase(),
      host: String(host).toLowerCase() || "@",
      value: String(row.value ?? row.content ?? row.data ?? ""),
      ttl: normalizeDnsTtl(row.ttl as number | string | undefined),
      distance: Number(row.distance ?? 0) || 0,
    });
  }

  return out.sort((a, b) => {
    if (a.host !== b.host) return a.host.localeCompare(b.host);
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.value.localeCompare(b.value);
  });
}

/** NameSilo requires the zone apex as `@`; the panel already stores it that way. */
export function dnsRecordSummary(record: ProviderDnsRecord): string {
  const host = record.host === "@" ? "" : record.host;
  return `${
    record.type === "MX" || record.type === "SRV" ? `${record.distance} · ` : ""
  }${host} → ${record.value}`;
}
