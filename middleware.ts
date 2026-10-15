import { NextRequest, NextResponse } from "next/server";

import { sanitizeCustomerRedirectPath } from "@/lib/customer/safe-redirect";
import { requestSiteOrigin } from "@/lib/customer/site-origin";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";
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

  if (!isOrbitPage && !isOrbitApi) {
    return NextResponse.next();
  }

  // Legacy login URL → clean /orbit (no ?next=)
  if (pathname === "/orbit/login" || pathname.startsWith("/orbit/login/")) {
    return redirectToOrbit(request);
  }

  if (isAuthApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ORBIT_SESSION_COOKIE)?.value;
  const verified = await verifyOrbitJwt(token);

  // Unauthenticated: stay on /orbit for the gate. Other Orbit pages → /orbit.
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

export const config = {
  matcher: ["/account/:path*", "/orbit/:path*", "/api/orbit/:path*"],
};
