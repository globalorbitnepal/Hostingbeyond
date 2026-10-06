import type { DomainResult } from "@/lib/domains/availability";

export type FastSearchCachedPayload = {
  anchorDomain: string;
  query: string;
  primary: DomainResult | null;
  alternatives: DomainResult[];
  cachedAt: number;
  expiresAt: number;
};

const cache = new Map<string, FastSearchCachedPayload>();
const inflight = new Map<string, Promise<FastSearchCachedPayload>>();

function ttlMs(): number {
  const raw = Number(process.env.DOMAIN_FAST_SEARCH_CACHE_TTL_MS ?? 120_000);
  if (!Number.isFinite(raw) || raw < 0) return 120_000;
  return Math.min(Math.max(raw, 10_000), 600_000);
}

export function fastSearchCacheKey(normalizedName: string): string {
  return `fast:${normalizedName.trim().toLowerCase()}`;
}

export function getFastSearchCache(
  key: string,
): FastSearchCachedPayload | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit;
}

export function setFastSearchCache(
  key: string,
  payload: Omit<FastSearchCachedPayload, "cachedAt" | "expiresAt">,
): FastSearchCachedPayload {
  const now = Date.now();
  const entry: FastSearchCachedPayload = {
    ...payload,
    cachedAt: now,
    expiresAt: now + ttlMs(),
  };
  cache.set(key, entry);
  return entry;
}

export async function withFastSearchDedup(
  key: string,
  run: () => Promise<Omit<FastSearchCachedPayload, "cachedAt" | "expiresAt">>,
): Promise<{ payload: FastSearchCachedPayload; cacheHit: boolean }> {
  const cached = getFastSearchCache(key);
  if (cached) return { payload: cached, cacheHit: true };

  const pending = inflight.get(key);
  if (pending) {
    const payload = await pending;
    return { payload, cacheHit: false };
  }

  const promise = run().then((fresh) => setFastSearchCache(key, fresh));
  inflight.set(key, promise);
  try {
    const payload = await promise;
    return { payload, cacheHit: false };
  } finally {
    inflight.delete(key);
  }
}

/** @internal */
export function clearFastSearchCacheForTests(): void {
  cache.clear();
  inflight.clear();
}
