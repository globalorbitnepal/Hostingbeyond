import {
  isEditableDnsType,
  normalizeDnsHost,
  validateDnsValue,
} from "@/lib/domains/providers/namesilo-dns";

export const DNS_TTL_MIN = 300;
export const DNS_TTL_MAX = 86400;
export const DNS_TTL_WHEN_OMITTED = 3600;

export type DnsProposalAction = "add" | "update" | "delete";

export type StrictDnsChange = {
  action: DnsProposalAction;
  type: string;
  host: string;
  value: string;
  ttl: number;
  priority: number | null;
};

export function validateStrictDnsChange(
  input: {
    action: DnsProposalAction;
    type: string;
    host: string;
    value: string;
    ttl?: number | null;
    priority?: number | null;
  },
  zone: string,
): { ok: true; change: StrictDnsChange } | { ok: false; error: string } {
  const type = input.type.trim().toUpperCase();
  if (!isEditableDnsType(type)) {
    return { ok: false, error: "That record type is not supported." };
  }
  const host = normalizeDnsHost(input.host, zone);
  if (!host.ok) return host;
  if (input.action !== "delete") {
    const value = validateDnsValue(type, input.value);
    if (!value.ok) return value;
    const ttl = strictTtl(input.ttl);
    if (!ttl.ok) return ttl;
    const priority = strictPriority(type, input.priority);
    if (!priority.ok) return priority;
    return {
      ok: true,
      change: {
        action: input.action,
        type,
        host: host.host,
        value: value.value,
        ttl: ttl.ttl,
        priority: priority.priority,
      },
    };
  }
  return {
    ok: true,
    change: {
      action: "delete",
      type,
      host: host.host,
      value: input.value.trim(),
      ttl: typeof input.ttl === "number" ? input.ttl : 0,
      priority: input.priority ?? null,
    },
  };
}

function strictTtl(
  raw: number | null | undefined,
): { ok: true; ttl: number } | { ok: false; error: string } {
  if (raw == null) return { ok: true, ttl: DNS_TTL_WHEN_OMITTED };
  if (!Number.isInteger(raw) || raw < DNS_TTL_MIN || raw > DNS_TTL_MAX) {
    return {
      ok: false,
      error: "TTL must be a whole number of seconds from 300 to 86400.",
    };
  }
  return { ok: true, ttl: raw };
}

function strictPriority(
  type: string,
  raw: number | null | undefined,
): { ok: true; priority: number | null } | { ok: false; error: string } {
  if (type !== "MX") return { ok: true, priority: null };
  if (raw == null || !Number.isInteger(raw) || raw < 0 || raw > 65535) {
    return {
      ok: false,
      error: "MX priority must be a whole number from 0 to 65535.",
    };
  }
  return { ok: true, priority: raw };
}
