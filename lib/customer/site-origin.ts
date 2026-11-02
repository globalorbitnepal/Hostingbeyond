import type { NextRequest } from "next/server";

import { routes } from "@/config/routes";
import { sanitizeCustomerRedirectPath } from "@/lib/customer/safe-redirect";

/** Canonical public site when env is unset in production builds. */
export const DEFAULT_PUBLIC_SITE_ORIGIN = "https://hosting.theglobalorbit.com";

export const STOREFRONT_PUBLIC_HOST = "hosting.theglobalorbit.com";

/** OAuth redirect_uri host when env is unset — must be a live DNS name (see .env.example). */
export const DEFAULT_CUSTOMER_OAUTH_PUBLIC_ORIGIN = DEFAULT_PUBLIC_SITE_ORIGIN;

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
  if (site) return normalizeStorefrontOAuthOrigin(site);

  const app = normalizeEnvSiteOrigin(process.env.NEXT_PUBLIC_APP_URL, {
    production,
  });
  if (app) return normalizeStorefrontOAuthOrigin(app);

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

/**
 * OAuth redirect_uri host. Production uses `NEXT_PUBLIC_SITE_URL` (or
 * `CUSTOMER_OAUTH_PUBLIC_ORIGIN` when set). Dev uses the live request host.
 */
/** Legacy env value — domain has no public DNS; do not use for OAuth redirect_uri. */
const DEPRECATED_OAUTH_PUBLIC_ORIGINS = new Set([
  "https://hostingbeyond.com",
  "http://hostingbeyond.com",
]);

function resolveOAuthPublicOriginFromEnv(): string | null {
  const production = process.env.NODE_ENV === "production";
  const fromEnv = normalizeEnvSiteOrigin(
    process.env.CUSTOMER_OAUTH_PUBLIC_ORIGIN,
    { production },
  );
  if (!fromEnv) return null;
  const key = stripTrailingSlash(fromEnv).toLowerCase();
  if (DEPRECATED_OAUTH_PUBLIC_ORIGINS.has(key)) return null;
  return fromEnv;
}

export function storefrontSiteOriginForOAuth(
  input?: RequestOriginInput,
): string {
  const production = process.env.NODE_ENV === "production";
  const fromEnv = resolveOAuthPublicOriginFromEnv();
  if (fromEnv) return fromEnv;
  if (production) return configuredSiteOrigin();
  if (input) return stripTrailingSlash(resolveRequestSiteOrigin(input));
  return configuredSiteOrigin();
}

export function oauthOriginsMatch(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return stripTrailingSlash(a) === stripTrailingSlash(b);
  }
}

export function allowedCustomerReturnOrigins(): string[] {
  const set = new Set<string>();
  const add = (raw: string | undefined) => {
    const normalized = raw?.trim() ? stripTrailingSlash(raw.trim()) : null;
    if (normalized && !isLoopbackOrigin(normalized)) set.add(normalized);
  };
  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.NEXT_PUBLIC_APP_URL);
  set.add(DEFAULT_PUBLIC_SITE_ORIGIN);
  set.add(DEFAULT_CUSTOMER_OAUTH_PUBLIC_ORIGIN);
  return [...set];
}

/** Where the customer started OAuth — must be an allowed storefront origin. */
export function resolveStorefrontReturnOrigin(
  input: RequestOriginInput,
): string {
  const requestOrigin = stripTrailingSlash(resolveRequestSiteOrigin(input));
  const allowed = allowedCustomerReturnOrigins();
  if (
    allowed.some((candidate) => oauthOriginsMatch(candidate, requestOrigin))
  ) {
    return requestOrigin;
  }
  return configuredSiteOrigin();
}

function normalizeStorefrontOAuthOrigin(origin: string): string {
  const normalized = stripTrailingSlash(origin);
  try {
    const host = new URL(normalized).hostname.toLowerCase();
    if (
      host === "theglobalorbit.com" ||
      host === "www.theglobalorbit.com" ||
      host === STOREFRONT_PUBLIC_HOST
    ) {
      return DEFAULT_PUBLIC_SITE_ORIGIN;
    }
  } catch {
    /* use resolved origin */
  }
  return normalized;
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
