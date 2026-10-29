import { NextRequest, NextResponse } from "next/server";

import { sanitizeCustomerRedirectPath } from "@/lib/customer/safe-redirect";
import {
  isLoopbackHost,
  requestSiteOrigin,
  internalAppRewriteUrl,
} from "@/lib/customer/site-origin";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";
import {
  LOCALE_REWRITE_HEADER,
  localePrefixRewritePath,
  shouldApplyLocaleRouting,
  stripLocalePrefixFromPath,
} from "@/lib/i18n/locale-path";
import {
  LOCALE_COOKIE,
  parsePreferencesCookie,
  preferencesCookieOptions,
  serializePreferences,
} from "@/lib/i18n/preferences";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";
import {
  resolveWebsiteLanguageCode,
  type WebsiteLanguageCode,
} from "@/lib/i18n/website-languages";
import { ORBIT_SESSION_COOKIE, verifyOrbitJwt } from "@/lib/orbit/jwt";

/**
 * Behind the reverse proxy Next derives request.url from the listening address,
 * so redirects must be rebuilt from the forwarded host to stay on the site.
 */
function redirectToOrbit(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : request.url;
  return NextResponse.redirect(new URL("/orbit", base));
}

function mergeLocaleCookie(
  request: NextRequest,
  response: NextResponse,
  language: WebsiteLanguageCode,
) {
  if (PUBLIC_ENGLISH_ONLY) return response;
  const raw = request.cookies.get(LOCALE_COOKIE)?.value;
  const current = parsePreferencesCookie(raw);
  const googleTargetLang = resolveWebsiteLanguageCode(language);
  if (current.googleTargetLang === googleTargetLang) return response;
  const next = {
    ...current,
    googleTargetLang,
    languageLocked: true,
  };
  const opts = preferencesCookieOptions();
  response.cookies.set(LOCALE_COOKIE, serializePreferences(next), {
    path: opts.path,
    maxAge: opts.maxAge,
    sameSite: opts.sameSite,
    secure: opts.secure,
  });
  return response;
}

function isInternalLocaleRewriteRequest(request: NextRequest): boolean {
  if (request.headers.get(LOCALE_REWRITE_HEADER) === "1") return true;
  const host = request.headers.get("host") ?? "";
  const forwarded = request.headers.get("x-forwarded-host")?.trim() ?? "";
  return isLoopbackHost(host) && !forwarded;
}

function handlePublicLocaleRouting(request: NextRequest): NextResponse | null {
  if (PUBLIC_ENGLISH_ONLY) return null;
  const { pathname } = request.nextUrl;
  if (!shouldApplyLocaleRouting(pathname)) return null;
  if (isInternalLocaleRewriteRequest(request)) return null;

  const rewritePath = localePrefixRewritePath(pathname);
  if (!rewritePath) return null;

  const parsed = stripLocalePrefixFromPath(pathname);
  const headers = new Headers(request.headers);
  headers.set(LOCALE_REWRITE_HEADER, "1");
  const response = NextResponse.rewrite(
    internalAppRewriteUrl(rewritePath, request.nextUrl.search),
    { request: { headers } },
  );
  return mergeLocaleCookie(request, response, parsed.language);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/account")) {
    const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    const verified = await verifyCustomerJwt(token);
    if (!verified) {
      const returnPath = sanitizeCustomerRedirectPath(
        `${pathname}${request.nextUrl.search}`,
      );
      const login = new URL("/login", requestSiteOrigin(request));
      login.searchParams.set("next", returnPath);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  const isOrbitPage = pathname.startsWith("/orbit");
  const isOrbitApi = pathname.startsWith("/api/orbit");
  const isAuthApi = pathname.startsWith("/api/orbit/auth/");

  if (isOrbitPage || isOrbitApi) {
    if (pathname === "/orbit/login" || pathname.startsWith("/orbit/login/")) {
      return redirectToOrbit(request);
    }

    if (isAuthApi) {
      return NextResponse.next();
    }

    const token = request.cookies.get(ORBIT_SESSION_COOKIE)?.value;
    const verified = await verifyOrbitJwt(token);

    if (!verified) {
      if (isOrbitApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (pathname === "/orbit") {
        return NextResponse.next();
      }
      return redirectToOrbit(request);
    }

    return NextResponse.next();
  }

  const localeResponse = handlePublicLocaleRouting(request);
  if (localeResponse) return localeResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
