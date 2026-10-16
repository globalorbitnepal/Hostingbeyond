type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory fixed-window rate limit (per Node process).
 * Suitable for single-instance VPS; use a shared store if horizontally scaled.
 */
export function consumeRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) return false;
  bucket.count += 1;
  return true;
}

/**
 * Client key for rate limiting. Prefer `X-Real-IP` (set by Nginx on production)
 * over the first `X-Forwarded-For` hop, which clients can spoof when no proxy strips it.
 * Limitation: in-memory buckets are per Node process (not shared across PM2 instances).
 */
export function clientKeyFromRequest(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (hops.length) return hops[hops.length - 1] ?? "unknown";
  }
  return "unknown";
}

export function rateLimitResponse() {
  return { error: "Too many requests. Please try again shortly." };
}
