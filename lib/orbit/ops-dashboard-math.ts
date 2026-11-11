/** Pure helpers for the Orbit operations dashboard. No I/O. */

export const PAID_DOMAIN_STATUSES = [
  "PAID",
  "PROCESSING",
  "REGISTERING",
  "REGISTERED",
] as const;

export const OPEN_HOSTING_STATUSES = [
  "PAID",
  "PROVISIONING",
  "ACTIVE",
] as const;

export function money(amount: number, currency = "USD"): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

export function decimalToNumber(
  value: { toString(): string } | number | null | undefined,
): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}

export function renewalBucket(
  expiresAt: Date | null,
  now: Date,
  windowDays = 30,
): "none" | "expired" | "due" | "ok" {
  if (!expiresAt) return "none";
  const ms = expiresAt.getTime() - now.getTime();
  if (ms < 0) return "expired";
  if (ms <= windowDays * 24 * 60 * 60 * 1000) return "due";
  return "ok";
}

export function countSslBags(
  rows: Array<{ data: unknown }>,
  now: Date,
): { total: number; active: number; expiring: number; premium: number } {
  let total = 0;
  let active = 0;
  let expiring = 0;
  let premium = 0;
  const horizon = now.getTime() + 30 * 24 * 60 * 60 * 1000;
  for (const row of rows) {
    const data = row.data;
    if (!data || typeof data !== "object") continue;
    const certificates = (data as { certificates?: unknown }).certificates;
    if (!Array.isArray(certificates)) continue;
    for (const cert of certificates) {
      if (!cert || typeof cert !== "object") continue;
      total += 1;
      const record = cert as {
        status?: string;
        kind?: string;
        expiresAt?: string;
      };
      if (record.kind === "PREMIUM") premium += 1;
      if (record.status === "ACTIVE") active += 1;
      const expires = record.expiresAt ? Date.parse(record.expiresAt) : NaN;
      if (Number.isFinite(expires) && expires <= horizon) expiring += 1;
    }
  }
  return { total, active, expiring, premium };
}

export function countMailBags(rows: Array<{ data: unknown }>): number {
  let total = 0;
  for (const row of rows) {
    const data = row.data;
    if (!data || typeof data !== "object") continue;
    const messages = (data as { messages?: unknown }).messages;
    if (Array.isArray(messages)) total += messages.length;
  }
  return total;
}
