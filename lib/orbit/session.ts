import { createHash, randomBytes, timingSafeEqual } from "crypto";

import { prisma } from "@/lib/prisma";

import { SESSION_TTL_MS, signOrbitJwt, verifyOrbitJwt } from "./jwt";
import { hydrateOrbitEnvFromFile } from "./load-orbit-env";

export { ORBIT_SESSION_COOKIE, SESSION_TTL_MS, verifyOrbitJwt } from "./jwt";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function getEnrollmentSecret() {
  hydrateOrbitEnvFromFile();
  return process.env.ORBIT_ENROLLMENT_SECRET?.trim() ?? "";
}

export function verifyEnrollmentSecret(candidate: string) {
  const expected = getEnrollmentSecret();
  const input = candidate.trim();
  if (!expected || !input) return false;

  if (safeEqualString(hashSecret(input), hashSecret(expected))) {
    return true;
  }

  // Compatibility: some deployments stored sha256(accessKey) in .env
  if (
    /^[0-9a-f]{64}$/i.test(expected) &&
    safeEqualString(hashSecret(input), expected.toLowerCase())
  ) {
    return true;
  }

  return false;
}

export async function ensureOrbitAdmin() {
  const existing = await prisma.adminUser.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.adminUser.create({
    data: { displayName: "Super Admin" },
  });
}

/** Signed session without DB — used when Postgres is unavailable. */
export async function createJwtOnlySession() {
  const sid = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const token = await signOrbitJwt({
    sid,
    adminUserId: "orbit-super-admin",
  });
  return { token, expiresAt };
}

export async function createAdminSession(
  adminUserId: string,
  meta?: {
    userAgent?: string | null;
    ipAddress?: string | null;
  },
) {
  const raw = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash: hashToken(raw),
      expiresAt,
      userAgent: meta?.userAgent ?? undefined,
      ipAddress: meta?.ipAddress ?? undefined,
    },
  });

  const jwt = await signOrbitJwt({ sid: raw, adminUserId });

  return { token: jwt, expiresAt };
}

export async function destroyAdminSession(token: string | undefined) {
  const verified = await verifyOrbitJwt(token);
  if (!verified) return;
  await prisma.adminSession.deleteMany({
    where: { tokenHash: hashToken(verified.sid) },
  });
}

export async function getSessionAdmin(token: string | undefined) {
  const verified = await verifyOrbitJwt(token);
  if (!verified) return null;

  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(verified.sid) },
      include: { adminUser: true },
    });

    if (session) {
      if (session.expiresAt.getTime() < Date.now()) {
        await prisma.adminSession
          .delete({ where: { id: session.id } })
          .catch(() => undefined);
        return null;
      }
      return session.adminUser;
    }
  } catch {
    /* DB unavailable — fall through to JWT-only trust */
  }

  // Access-key JWT fallback (no DB row) or orphaned valid JWT
  if (verified.adminUserId) {
    return {
      id: verified.adminUserId,
      displayName: "Super Admin",
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
  }

  return null;
}

export async function logActivity(input: {
  adminUserId?: string | null;
  action:
    | "LOGIN"
    | "LOGOUT"
    | "LOGIN_FAILED"
    | "ENROLL"
    | "CONTENT_UPDATE"
    | "MEDIA_UPLOAD"
    | "MEDIA_REPLACE"
    | "MEDIA_DELETE"
    | "SETTINGS_UPDATE"
    | "NAV_UPDATE"
    | "SEO_UPDATE";
  resource?: string;
  details?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        adminUserId: input.adminUserId ?? undefined,
        action: input.action,
        resource: input.resource,
        details: input.details,
      },
    });
  } catch {
    /* ignore logging failures */
  }
}
