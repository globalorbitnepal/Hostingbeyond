import {
  clientKeyFromRequest,
  consumeRateLimit,
} from "@/lib/http/fixed-window-rate-limit";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;

export function rateLimitDomainSearch(key: string): boolean {
  return consumeRateLimit(`domain-search:${key}`, MAX_REQUESTS, WINDOW_MS);
}

export { clientKeyFromRequest };
