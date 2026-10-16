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
