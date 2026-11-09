/**
 * Mitigation for cookie-authenticated mutations from foreign origins (CSRF-style).
 * Browsers send `Origin` on cross-site POST; same-site / non-browser clients often omit it.
 * This is not a substitute for SameSite cookies; it adds defense in depth for sensitive routes.
 */
import { isTruthyEnvFlag } from "@/lib/config/env-flags";

export { isTruthyEnvFlag } from "@/lib/config/env-flags";

const BROWSER_MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function effectivePort(protocol: string, portField: string): number {
  if (portField) {
    const parsed = Number.parseInt(portField, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return -1;
    return parsed;
  }
  return protocol === "https:" ? 443 : 80;
}

/**
 * Canonical public site URL for CSRF checks.
 *
 * Behind the reverse proxy Next derives `request.url` from the listening socket,
 * so it can read `http://127.0.0.1:3030/...` while the browser sends
 * `Origin: https://hosting.theglobalorbit.com`. Trusting that loopback URL made
 * every Orbit wallet write fail with 403. We only substitute the proxy-supplied
 * `Host` header when the request URL is actually loopback, so a public request
 * URL is never widened by a forwarded header.
 */
export function requestCanonicalSiteUrl(request: Request): URL {
  const url = new URL(request.url);
  const host = request.headers.get("host")?.trim();
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  /**
   * Two proxy artefacts have to be repaired:
   * 1. `request.url` may be loopback while `Host` is the public domain.
   * 2. The socket is plain HTTP while the browser used HTTPS (TLS terminates at
   *    nginx), so the scheme must come from `X-Forwarded-Proto`.
   */
  const protocol =
    forwardedProto === "https" || forwardedProto === "http"
      ? `${forwardedProto}:`
      : url.protocol;

  if (!host) {
    if (protocol === url.protocol) return url;
    try {
      return new URL(`${protocol}//${url.host}${url.pathname}${url.search}`);
    } catch {
      return url;
    }
  }

  try {
    return new URL(`${protocol}//${host}${url.pathname}${url.search}`);
  } catch {
    return url;
  }
}

function parseHttpUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function mutationSourceUrl(
  request: Request,
  options?: { strict?: boolean },
): URL | null | "missing" {
  const origin = request.headers.get("origin")?.trim();
  if (origin) {
    return parseHttpUrl(origin);
  }
  const strict =
    options?.strict ?? isTruthyEnvFlag(process.env.CSRF_STRICT_ORIGIN);
  if (!strict) return "missing";
  const referer = request.headers.get("referer")?.trim();
  if (!referer) return "missing";
  return parseHttpUrl(referer);
}

function crossOriginSiteMismatch(site: URL, source: URL): boolean {
  if (source.protocol !== site.protocol) return true;
  if (source.hostname !== site.hostname) return true;
  return (
    effectivePort(source.protocol, source.port) !==
    effectivePort(site.protocol, site.port)
  );
}

/**
 * Returns true when the browser-originated mutation should be blocked (respond 403).
 *
 * When `Origin` is present, protocol, host, and effective port must match `request.url`.
 * When `Origin` is absent, allow by default (CLI, native apps). Set `CSRF_STRICT_ORIGIN=1`
 * to require a matching `Origin` or `Referer`.
 */
export function crossOriginBrowserMutationBlocked(
  request: Request,
  options?: { ignoreTestBypass?: boolean; strict?: boolean },
): boolean {
  if (!options?.ignoreTestBypass && process.env.NODE_ENV === "test") {
    return false;
  }
  if (!BROWSER_MUTATION_METHODS.has(request.method.toUpperCase())) {
    return false;
  }

  const strict =
    options?.strict ?? isTruthyEnvFlag(process.env.CSRF_STRICT_ORIGIN);
  const site = requestCanonicalSiteUrl(request);
  const source = mutationSourceUrl(request, { strict });

  if (source === "missing") return strict;
  if (source === null) return true;
  return crossOriginSiteMismatch(site, source);
}
