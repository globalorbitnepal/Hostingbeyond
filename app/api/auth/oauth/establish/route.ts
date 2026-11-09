import { NextRequest, NextResponse } from "next/server";

import { verifyOAuthEstablishToken } from "@/lib/customer/oauth-bridge";
import {
  createCustomerSession,
  customerCookieOptions,
} from "@/lib/customer/session";
import { absoluteSiteUrl } from "@/lib/customer/site-origin";
import { requestIp } from "@/lib/customer/request-country";
import { recordCustomerSignInActivity } from "@/lib/customer/signin-activity";
import { routes } from "@/config/routes";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("token")?.trim();
  if (!raw) {
    return NextResponse.redirect(
      absoluteSiteUrl(request, "/login?error=oauth"),
    );
  }

  const verified = await verifyOAuthEstablishToken(raw);
  if (!verified) {
    return NextResponse.redirect(
      absoluteSiteUrl(request, "/login?error=oauth"),
    );
  }

  const { token, expiresAt } = await createCustomerSession(verified.userId, {
    remember: true,
    userAgent: request.headers.get("user-agent"),
    ipAddress: requestIp(request),
  });

  await recordCustomerSignInActivity({
    userId: verified.userId,
    method: "oauth",
    request,
  });

  const response = NextResponse.redirect(
    absoluteSiteUrl(request, verified.nextPath, routes.account),
  );
  const cookie = customerCookieOptions(expiresAt);
  response.cookies.set(cookie.name, token, cookie);
  return response;
}
