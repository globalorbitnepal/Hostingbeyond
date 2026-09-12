import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";
import { sessionSecret } from "@/lib/orbit/jwt";

export const CUSTOMER_SESSION_COOKIE = "hb_customer_session";
export const CUSTOMER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
export const CUSTOMER_SESSION_SHORT_TTL_MS = 1000 * 60 * 60 * 12;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signCustomerJwt(payload: {
  sid: string;
  customerUserId: string;
  ttlMs: number;
}) {
  return new SignJWT({
    sid: payload.sid,
    sub: payload.customerUserId,
    kind: "customer",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(payload.ttlMs / 1000)}s`)
    .sign(sessionSecret());
}

export async function verifyCustomerJwt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    if (payload.kind !== "customer") return null;
    const sid = typeof payload.sid === "string" ? payload.sid : null;
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    if (!sid || !sub) return null;
    return { sid, customerUserId: sub };
  } catch {
    return null;
  }
}

export async function createCustomerSession(
  customerUserId: string,
  options?: {
    remember?: boolean;
    userAgent?: string | null;
    ipAddress?: string | null;
  },
) {
  const raw = randomBytes(32).toString("base64url");
  const ttlMs = options?.remember
    ? CUSTOMER_SESSION_TTL_MS
    : CUSTOMER_SESSION_SHORT_TTL_MS;
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.customerSession.create({
    data: {
      userId: customerUserId,
      tokenHash: hashToken(raw),
      expiresAt,
      userAgent: options?.userAgent ?? undefined,
      ipAddress: options?.ipAddress ?? undefined,
    },
  });

  const token = await signCustomerJwt({
    sid: raw,
    customerUserId,
    ttlMs,
  });

  return { token, expiresAt };
}

export async function destroyCustomerSession(token: string | undefined) {
  const verified = await verifyCustomerJwt(token);
  if (!verified) return;
  await prisma.customerSession
    .deleteMany({ where: { tokenHash: hashToken(verified.sid) } })
    .catch(() => undefined);
}

export async function getCustomerFromToken(token: string | undefined) {
  const verified = await verifyCustomerJwt(token);
  if (!verified) return null;

  const session = await prisma.customerSession.findUnique({
    where: { tokenHash: hashToken(verified.sid) },
    include: { user: true },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) {
      await prisma.customerSession
        .delete({ where: { id: session.id } })
        .catch(() => undefined);
    }
    return null;
  }

  return session.user;
}

export function customerCookieOptions(expiresAt: Date) {
  return {
    name: CUSTOMER_SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}
