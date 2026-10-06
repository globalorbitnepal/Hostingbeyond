/**
 * Shared reseller-wide gate for Domain Name API HTTP calls (2 starts/sec).
 * Requests may overlap; we only pace when a new request *starts*.
 */

const MAX_STARTS_PER_WINDOW = 2;
const WINDOW_MS = 1000;
const MIN_GAP_MS = Number(process.env.DOMAIN_API_MIN_REQUEST_GAP_MS ?? 500);

const startTimestamps: number[] = [];
let lastStartAt = 0;

let providerRequestCount = 0;
let rateLimit429Count = 0;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function acquireStartSlot(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (
      startTimestamps.length > 0 &&
      startTimestamps[0]! < now - WINDOW_MS
    ) {
      startTimestamps.shift();
    }
    const gapOk = now - lastStartAt >= MIN_GAP_MS;
    const windowOk = startTimestamps.length < MAX_STARTS_PER_WINDOW;
    if (gapOk && windowOk) {
      startTimestamps.push(now);
      lastStartAt = now;
      return;
    }
    const waitGap = Math.max(0, MIN_GAP_MS - (now - lastStartAt));
    const waitWindow =
      startTimestamps.length >= MAX_STARTS_PER_WINDOW
        ? Math.max(0, startTimestamps[0]! + WINDOW_MS - now)
        : 0;
    await sleep(
      Math.max(1, Math.min(waitGap || 1, waitWindow || waitGap || 1)),
    );
  }
}

export function getDnaProviderMetrics(): {
  providerRequestCount: number;
  rateLimit429Count: number;
} {
  return { providerRequestCount, rateLimit429Count };
}

export function resetDnaProviderMetricsForTests(): void {
  providerRequestCount = 0;
  rateLimit429Count = 0;
  startTimestamps.length = 0;
  lastStartAt = 0;
}

export function recordDna429(): void {
  rateLimit429Count += 1;
}

export type DnaRateLimitMeta = {
  domainCount: number;
  onSlotAcquired?: (slotAt: number) => void;
};

export async function withDnaRateLimit<T>(
  run: (slotAcquiredAt: number) => Promise<T>,
  meta?: DnaRateLimitMeta,
): Promise<T> {
  await acquireStartSlot();
  const slotAt = Date.now();
  providerRequestCount += 1;
  meta?.onSlotAcquired?.(slotAt);
  void meta?.domainCount;
  return run(slotAt);
}
