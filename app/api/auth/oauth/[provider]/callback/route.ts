import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/customer/password";
import {
  fetchOAuthProfile,
  getOAuthProvider,
  isOAuthProvider,
  oauthCallbackUrl,
} from "@/lib/customer/oauth";
import {
  createCustomerSession,
  customerCookieOptions,
} from "@/lib/customer/session";
import { sessionSecret } from "@/lib/orbit/jwt";

function fail(request: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/login?error=${code}`, request.url));
}

async function exchangeCode(
  provider: ReturnType<typeof getOAuthProvider>,
  code: string,
) {
  const body = new URLSearchParams({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    code,
    redirect_uri: oauthCallbackUrl(provider.provider),
    grant_type: "authorization_code",
  });

  const res = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token || null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await context.params;
  if (!isOAuthProvider(rawProvider)) return fail(request, "oauth");

  if (request.nextUrl.searchParams.get("error")) {
    return fail(request, "oauth_denied");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("hb_oauth_state")?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return fail(request, "oauth");
  }

  let nextPath = "/account";
  try {
    const { payload } = await jwtVerify(state, sessionSecret());
    if (payload.kind !== "oauth" || payload.provider !== rawProvider) {
      return fail(request, "oauth");
    }
    if (typeof payload.next === "string" && payload.next.startsWith("/")) {
      nextPath = payload.next;
    }
  } catch {
    return fail(request, "oauth");
  }

  const provider = getOAuthProvider(rawProvider);
  if (!provider.configured) return fail(request, `${rawProvider}_unavailable`);

  const accessToken = await exchangeCode(provider, code);
  if (!accessToken) return fail(request, "oauth");

  const profile = await fetchOAuthProfile(rawProvider, accessToken);
  if (!profile) return fail(request, "oauth_profile");

  const email = normalizeEmail(profile.email);
  const linked = await prisma.customerOAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: rawProvider,
        providerAccountId: profile.id,
      },
    },
    include: { user: true },
  });

  let user = linked?.user ?? null;
  if (!user) {
    user = await prisma.customerUser.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.customerUser.create({
        data: {
          email,
          name: profile.name || null,
          image: profile.image || null,
        },
      });
    } else if (profile.image && !user.image) {
      user = await prisma.customerUser.update({
        where: { id: user.id },
        data: { image: profile.image, name: user.name || profile.name || null },
      });
    }

    await prisma.customerOAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: rawProvider,
          providerAccountId: profile.id,
        },
      },
      update: { userId: user.id },
      create: {
        userId: user.id,
        provider: rawProvider,
        providerAccountId: profile.id,
      },
    });
  }

  const { token, expiresAt } = await createCustomerSession(user.id, {
    remember: true,
    userAgent: request.headers.get("user-agent"),
  });

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  const cookie = customerCookieOptions(expiresAt);
  response.cookies.set(cookie.name, token, cookie);
  response.cookies.set("hb_oauth_state", "", {
    path: "/",
    expires: new Date(0),
  });
  return response;
}
