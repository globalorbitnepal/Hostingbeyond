import { SignJWT, jwtVerify } from "jose";

import { sanitizeCustomerRedirectPath } from "@/lib/customer/safe-redirect";
import { sessionSecret } from "@/lib/orbit/jwt";
import { routes } from "@/config/routes";

export async function signOAuthEstablishToken(input: {
  userId: string;
  nextPath: string;
}) {
  return new SignJWT({
    kind: "oauth_establish",
    sub: input.userId,
    next: sanitizeCustomerRedirectPath(input.nextPath, routes.account),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("120s")
    .sign(sessionSecret());
}

export async function verifyOAuthEstablishToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    if (payload.kind !== "oauth_establish") return null;
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    if (!userId) return null;
    const nextPath = sanitizeCustomerRedirectPath(
      typeof payload.next === "string" ? payload.next : routes.account,
      routes.account,
    );
    return { userId, nextPath };
  } catch {
    return null;
  }
}
