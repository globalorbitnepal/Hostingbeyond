import { routes } from "@/config/routes";

const MAX_REDIRECT_LEN = 2048;

/**
 * Customer-facing post-auth and OAuth `next` paths must stay on this site.
 * Rejects open redirects, protocol-relative URLs, and traversal segments.
 */
export function sanitizeCustomerRedirectPath(
  raw: string | null | undefined,
  fallback: string = routes.account,
): string {
  if (raw == null || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("\0")) return fallback;
  if (/^\/[^/]*@/i.test(trimmed)) return fallback;
  if (trimmed.includes("..")) return fallback;

  try {
    const url = new URL(trimmed, "http://local.invalid");
    if (url.hostname !== "local.invalid") return fallback;
    const path = url.pathname;
    if (!path.startsWith("/") || path.includes("..")) return fallback;
    let decodedPath = path;
    try {
      decodedPath = decodeURIComponent(path);
    } catch {
      return fallback;
    }
    if (
      decodedPath.startsWith("//") ||
      decodedPath.includes("..") ||
      decodedPath.includes("\\")
    ) {
      return fallback;
    }
    const out = `${path}${url.search}`;
    if (!out.startsWith("/") || out.length > MAX_REDIRECT_LEN) return fallback;
    return out;
  } catch {
    return fallback;
  }
}
