export type OAuthProvider = "google" | "github" | "facebook";

export function publicOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.ORBIT_ORIGIN?.trim() ||
    "https://hosting.theglobalorbit.com"
  );
}

export function oauthCallbackUrl(provider: OAuthProvider) {
  return `${publicOrigin()}/api/auth/oauth/${provider}/callback`;
}

export function getOAuthProvider(provider: OAuthProvider) {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
    return {
      provider,
      configured: Boolean(clientId && clientSecret),
      clientId,
      clientSecret,
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scope: "openid email profile",
    };
  }

  if (provider === "github") {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim() ?? "";
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim() ?? "";
    return {
      provider,
      configured: Boolean(clientId && clientSecret),
      clientId,
      clientSecret,
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      scope: "read:user user:email",
    };
  }

  const clientId = process.env.FACEBOOK_APP_ID?.trim() ?? "";
  const clientSecret = process.env.FACEBOOK_APP_SECRET?.trim() ?? "";
  return {
    provider,
    configured: Boolean(clientId && clientSecret),
    clientId,
    clientSecret,
    authorizationUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "email,public_profile",
  };
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github" || value === "facebook";
}

export type OAuthProfile = {
  id: string;
  email: string;
  name?: string;
  image?: string;
};

export async function fetchOAuthProfile(
  provider: OAuthProvider,
  accessToken: string,
): Promise<OAuthProfile | null> {
  if (provider === "google") {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    if (!data.sub || !data.email) return null;
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      image: data.picture,
    };
  }

  if (provider === "github") {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "HostingBeyond",
      },
      cache: "no-store",
    });
    if (!userRes.ok) return null;
    const user = (await userRes.json()) as {
      id?: number;
      login?: string;
      name?: string;
      email?: string | null;
      avatar_url?: string;
    };
    let email = user.email?.trim() ?? "";
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "HostingBeyond",
        },
        cache: "no-store",
      });
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as Array<{
          email?: string;
          primary?: boolean;
          verified?: boolean;
        }>;
        email =
          emails.find((item) => item.primary && item.verified)?.email ||
          emails.find((item) => item.verified)?.email ||
          emails[0]?.email ||
          "";
      }
    }
    if (!user.id || !email) return null;
    return {
      id: String(user.id),
      email,
      name: user.name || user.login,
      image: user.avatar_url,
    };
  }

  const res = await fetch(
    "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  };
  if (!data.id || !data.email) return null;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.picture?.data?.url,
  };
}
