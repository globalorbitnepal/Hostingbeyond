import { SignJWT, jwtVerify } from "jose";

/** Edge-safe JWT helpers — no Node crypto / Prisma. Used by middleware. */

export const ORBIT_SESSION_COOKIE = "hb_orbit_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export function sessionSecret() {
  const value = process.env.ORBIT_SESSION_SECRET?.trim();
  if (value) return new TextEncoder().encode(value);

  if (process.env.NODE_ENV === "production") {
    throw new Error("ORBIT_SESSION_SECRET is required in production");
  }

  return new TextEncoder().encode("hostingbeyond-orbit-dev-secret-change-me");
}

export async function signOrbitJwt(payload: {
  sid: string;
  adminUserId: string;
}) {
  return new SignJWT({
    sid: payload.sid,
    sub: payload.adminUserId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(SESSION_TTL_MS / 1000)}s`)
    .sign(sessionSecret());
}

export async function verifyOrbitJwt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const sid = typeof payload.sid === "string" ? payload.sid : null;
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!sid || !sub) return null;
    return { sid, adminUserId: sub };
  } catch {
    return null;
  }
}
