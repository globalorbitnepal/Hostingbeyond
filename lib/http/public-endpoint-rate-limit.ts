import {
  clientKeyFromRequest,
  consumeRateLimit,
} from "@/lib/http/fixed-window-rate-limit";

const WINDOW_MS = 60_000;

export function rateLimitAuthEndpoint(request: Request): boolean {
  const key = `auth:${clientKeyFromRequest(request)}`;
  return consumeRateLimit(key, 20, WINDOW_MS);
}

export function rateLimitContactForm(request: Request): boolean {
  const key = `contact:${clientKeyFromRequest(request)}`;
  return consumeRateLimit(key, 8, WINDOW_MS);
}

export function rateLimitNewsletter(request: Request): boolean {
  const key = `newsletter:${clientKeyFromRequest(request)}`;
  return consumeRateLimit(key, 6, WINDOW_MS);
}

/** Website migration intake — per-process window; see fixed-window-rate-limit.ts. */
export function rateLimitMigrationRequest(request: Request): boolean {
  const key = `migration:${clientKeyFromRequest(request)}`;
  return consumeRateLimit(key, 6, WINDOW_MS);
}

/** Cloud Translation batches — per-process window. */
export function rateLimitCloudTranslate(request: Request): boolean {
  const key = `gct:${clientKeyFromRequest(request)}`;
  return consumeRateLimit(key, 60, WINDOW_MS);
}
