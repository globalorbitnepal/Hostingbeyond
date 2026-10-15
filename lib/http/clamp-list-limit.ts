/** Safe take limit for customer list APIs (rejects NaN and out-of-range values). */
export function clampListLimit(
  raw: number | undefined,
  defaultLimit: number,
  maxLimit: number,
): number {
  if (raw === undefined || !Number.isFinite(raw)) return defaultLimit;
  const n = Math.trunc(raw);
  if (n < 1) return defaultLimit;
  return Math.min(n, maxLimit);
}

export function parseLimitQuery(
  raw: string | null,
  defaultLimit: number,
  maxLimit: number,
): number {
  if (!raw?.trim()) return defaultLimit;
  const parsed = Number.parseInt(raw, 10);
  return clampListLimit(parsed, defaultLimit, maxLimit);
}
