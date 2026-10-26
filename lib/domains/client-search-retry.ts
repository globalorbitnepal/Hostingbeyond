/** Bulk search client retry policy — server already retries DNA chunks on 429. */

export function parseRetryAfterMs(
  header: string | null | undefined,
): number | null {
  if (!header?.trim()) return null;
  const trimmed = header.trim();
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(Math.ceil(seconds * 1000), 60_000);
  }
  const date = Date.parse(trimmed);
  if (!Number.isFinite(date)) return null;
  const delta = date - Date.now();
  if (delta <= 0) return null;
  return Math.min(delta, 60_000);
}

export function shouldRetryBulkSearchResponse(
  status: number,
  attempt: number,
  maxAttempts: number,
  retryAfterHeader?: string | null,
): { retry: boolean; delayMs: number } {
  if (attempt >= maxAttempts - 1) {
    return { retry: false, delayMs: 0 };
  }
  if (status === 429) {
    const fromHeader = parseRetryAfterMs(retryAfterHeader);
    const delayMs = fromHeader ?? 800 * (attempt + 1);
    return { retry: true, delayMs };
  }
  if (status === 502 || status === 503) {
    return { retry: true, delayMs: 600 * (attempt + 1) };
  }
  return { retry: false, delayMs: 0 };
}
