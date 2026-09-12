import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

import {
  getOAuthProvider,
  isOAuthProvider,
  oauthCallbackUrl,
} from "@/lib/customer/oauth";
import { sessionSecret } from "@/lib/orbit/jwt";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await context.params;
  if (!isOAuthProvider(rawProvider)) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const provider = getOAuthProvider(rawProvider);
  if (!provider.configured) {
    return NextResponse.redirect(
      new URL(`/login?error=${rawProvider}_unavailable`, request.url),
    );
  }

  const next = request.nextUrl.searchParams.get("next") || "/account";
  const nonce = crypto.randomUUID();
  const state = await new SignJWT({
    kind: "oauth",
    provider: rawProvider,
    nonce,
    next: next.startsWith("/") ? next : "/account",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(sessionSecret());

  const url = new URL(provider.authorizationUrl);
  url.searchParams.set("client_id", provider.clientId);
  url.searchParams.set("redirect_uri", oauthCallbackUrl(rawProvider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", provider.scope);
  url.searchParams.set("state", state);
  if (rawProvider === "google") {
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");
  }

  const response = NextResponse.redirect(url);
  response.cookies.set("hb_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
