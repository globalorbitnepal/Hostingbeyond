import type {
  ProviderDnsRecord,
  ProviderDnsRecordInput,
} from "@/lib/domains/providers/provider";

type DnaZoneRow = {
  name?: unknown;
  type?: unknown;
  ttl?: unknown;
  records?: unknown;
};

const EXCLUDED_TYPES = new Set(["SOA", "NS", "DNSSEC", "CAA"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** `www.example.com.` → `www`, apex → `@`. */
export function dnaHostLabel(name: string, domain: string): string {
  const clean = name.trim().toLowerCase().replace(/\.$/, "");
  const apex = domain.trim().toLowerCase().replace(/\.$/, "");
  if (!clean || clean === apex) return "@";
  if (clean.endsWith(`.${apex}`)) return clean.slice(0, -(apex.length + 1));
  return clean;
}

/** MX content may carry a priority prefix (`10 mail.example.com.`). */
function splitMx(content: string): { value: string; distance: number } {
  const match = /^(\d+)\s+(.+)$/.exec(content.trim());
  if (!match) return { value: content.trim(), distance: 10 };
  return { value: match[2]!.trim(), distance: Number(match[1]) };
}

/**
 * Flattens DNA's record-set response into one row per value.
 * SOA/NS are managed by the registry and are not customer-editable.
 */
export function parseDnaZoneRecords(
  payload: unknown,
  domain: string,
): ProviderDnsRecord[] {
  const rows = Array.isArray(payload) ? payload : [];
  const out: ProviderDnsRecord[] = [];
  for (const raw of rows) {
    const row = asRecord(raw) as DnaZoneRow | null;
    if (!row) continue;
    const type = String(row.type ?? "")
      .trim()
      .toUpperCase();
    if (!type || EXCLUDED_TYPES.has(type)) continue;
    const host = dnaHostLabel(String(row.name ?? ""), domain);
    const ttl = Number(row.ttl);
    const values = Array.isArray(row.records) ? row.records : [];
    for (const entry of values) {
      const record = asRecord(entry);
      if (!record || record.disabled === true) continue;
      const content = String(record.content ?? "").trim();
      if (!content) continue;
      const parsed =
        type === "MX" ? splitMx(content) : { value: content, distance: 0 };
      out.push({
        /** DNA replaces whole record sets, so type+host identifies the set. */
        recordId: `${type}:${host}`,
        type,
        host,
        value: parsed.value.replace(/\.$/, ""),
        ttl: Number.isFinite(ttl) ? ttl : 3600,
        distance: parsed.distance,
      });
    }
  }
  return out;
}

export function dnaZonePayload(domain: string, record: ProviderDnsRecordInput) {
  const host = record.host.trim() === "@" ? "" : record.host.trim();
  const value =
    record.type.toUpperCase() === "MX"
      ? `${record.distance ?? 10} ${record.value.trim().replace(/\.$/, "")}`
      : record.value.trim();
  return {
    domainName: domain.toLowerCase(),
    zoneStruct: {
      name: host,
      type: record.type.toUpperCase(),
      ttl: record.ttl,
      contents: [value],
    },
  };
}
