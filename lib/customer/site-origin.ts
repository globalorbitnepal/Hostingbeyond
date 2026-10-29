import type { NextRequest } from "next/server";

import { routes } from "@/config/routes";
import { sanitizeCustomerRedirectPath } from "@/lib/customer/safe-redirect";

/** Canonical public site when env is unset in production builds. */
export const DEFAULT_PUBLIC_SITE_ORIGIN = "https://hosting.theglobalorbit.com";

function stripTrailingSlash(origin: string) {
  return origin.replace(/\/+$/, "");
}

/** Testable: drop loopback public URLs in production builds. */
export function normalizeEnvSiteOrigin(
  raw: string | undefined,
  options: { production: boolean },
): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const normalized = stripTrailingSlash(trimmed);
  if (options.production && isLoopbackOrigin(normalized)) return null;
  return normalized;
}

export function isLoopbackHost(host: string): boolean {
  const hostname = host.toLowerCase().split(":")[0]?.trim() ?? "";
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "0.0.0.0"
  );
}

export function isLoopbackOrigin(origin: string): boolean {
  try {
    return isLoopbackHost(new URL(origin).host);
  } catch {
    return false;
  }
}

/**
 * Origin from environment — used for OAuth redirect_uri registration and fallback
 * when reverse-proxy headers are missing or loopback.
 */
export function configuredSiteOrigin(): string {
  const production = process.env.NODE_ENV === "production";
  const site = normalizeEnvSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL, {
    production,
  });
  if (site) return site;

  const app = normalizeEnvSiteOrigin(process.env.NEXT_PUBLIC_APP_URL, {
    production,
  });
  if (app) return app;

  const orbit = process.env.ORBIT_ORIGIN?.trim();
  if (orbit && !isLoopbackOrigin(orbit)) {
    return stripTrailingSlash(orbit);
  }

  if (process.env.NODE_ENV === "production") {
    return DEFAULT_PUBLIC_SITE_ORIGIN;
  }

  if (orbit) return stripTrailingSlash(orbit);
  return "http://localhost:3000";
}

export type RequestOriginInput = {
  forwardedHost?: string | null;
  host?: string | null;
  forwardedProto?: string | null;
};

/**
 * Public origin for redirects on this request. Prefers trusted forward headers;
 * never returns loopback when a public configured origin exists.
 */
export function resolveRequestSiteOrigin(input: RequestOriginInput): string {
  const host =
    input.forwardedHost?.split(",")[0]?.trim() || input.host?.trim() || "";
  const proto =
    input.forwardedProto?.split(",")[0]?.trim().toLowerCase() || "https";

  if (host && !isLoopbackHost(host)) {
    return `${proto === "http" ? "http" : "https"}://${host}`;
  }

  return configuredSiteOrigin();
}

/** Loopback origin for middleware rewrites (must match `next start -H 127.0.0.1 -p 3030`). */
export const INTERNAL_APP_SERVER_ORIGIN =
  process.env.HOSTINGBEYOND_INTERNAL_ORIGIN?.trim() || "http://127.0.0.1:3030";

/** Target URL for Next.js middleware rewrite to an app route (not the public site URL). */
export function internalAppRewriteUrl(pathname: string, search = ""): URL {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const target = new URL(path, `${INTERNAL_APP_SERVER_ORIGIN}/`);
  if (search) target.search = search.startsWith("?") ? search.slice(1) : search;
  return target;
}

export function requestSiteOrigin(request: NextRequest): string {
  return resolveRequestSiteOrigin({
    forwardedHost: request.headers.get("x-forwarded-host"),
    host: request.headers.get("host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
  });
}

/** Build an absolute on-site URL for redirects (path must be relative). */
export function absoluteSiteUrl(
  request: NextRequest,
  relativePath: string,
  fallbackPath = routes.account,
): URL {
  const safePath = sanitizeCustomerRedirectPath(relativePath, fallbackPath);
  return new URL(safePath, requestSiteOrigin(request));
}
