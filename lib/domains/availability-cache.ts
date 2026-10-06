import type { DomainResult } from "@/lib/domains/availability";

const DEFAULT_TTL_MS = 20_000;

type CachedPayload = {
  results: DomainResult[];
  source: "registrar" | "catalog";
  expiresAt: number;
};

const cache = new Map<string, CachedPayload>();
type SearchPayload = {
  results: DomainResult[];
  source: "registrar" | "catalog";
};
const inflight = new Map<string, Promise<SearchPayload>>();

function ttlMs(): number {
  const raw = Number(process.env.DOMAIN_SEARCH_CACHE_TTL_MS ?? DEFAULT_TTL_MS);
  if (!Number.isFinite(raw) || raw < 0) return DEFAULT_TTL_MS;
  return Math.min(Math.max(raw, 5_000), 60_000);
}

export function searchCacheKey(fqdns: string[]): string {
  return fqdns
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join("|");
}

export function getCachedSearch(
  key: string,
): { results: DomainResult[]; source: "registrar" | "catalog" } | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return { results: hit.results, source: hit.source };
}

export function setCachedSearch(
  key: string,
  payload: { results: DomainResult[]; source: "registrar" | "catalog" },
): void {
  cache.set(key, {
    ...payload,
    expiresAt: Date.now() + ttlMs(),
  });
}

export async function withSearchDedup(
  key: string,
  run: () => Promise<{
    results: DomainResult[];
    source: "registrar" | "catalog";
  }>,
): Promise<{ results: DomainResult[]; source: "registrar" | "catalog" }> {
  const cached = getCachedSearch(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = run()
    .then((payload) => {
      setCachedSearch(key, payload);
      return payload;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

/** @internal test helper */
export function clearSearchCacheForTests(): void {
  cache.clear();
  inflight.clear();
}
