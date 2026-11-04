type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10000;
const MAX_KEY_LENGTH = 160;

function sweepExpired(now: number) {
  if (buckets.size < 1024) return;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/**
 * In-memory fixed-window rate limit (per Node process).
 * Redis is not configured in this application. Do not describe this as shared
 * across PM2 instances. A future adapter should atomically INCR a key and set
 * a TTL, store only the counter, and fail closed or fall back to this map when
 * the shared store is down. It must not store request bodies.
 */
export function consumeRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucketKey = key.slice(0, MAX_KEY_LENGTH);
  sweepExpired(now);
  const bucket = buckets.get(bucketKey);
  if (!bucket || now > bucket.resetAt) {
    if (!bucket && buckets.size >= MAX_BUCKETS) return false;
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) return false;
  bucket.count += 1;
  return true;
}

export function rateLimitBucketCount(): number {
  return buckets.size;
}

/**
 * Client key for rate limiting. Prefer `X-Real-IP` (set by Nginx on production)
 * over the first `X-Forwarded-For` hop, which clients can spoof when no proxy strips it.
 * Limitation: in-memory buckets are per Node process (not shared across PM2 instances).
 */
export function clientKeyFromRequest(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim().slice(0, 80);
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const last = hops[hops.length - 1];
    if (last) return last.slice(0, 80);
  }
  return "unknown";
}

export function rateLimitResponse() {
  return { error: "Too many requests. Please try again shortly." };
}
