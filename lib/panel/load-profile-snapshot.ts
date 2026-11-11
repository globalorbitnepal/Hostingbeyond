import { cookies } from "next/headers";

import {
  CUSTOMER_SESSION_COOKIE,
  hashToken,
  verifyCustomerJwt,
} from "@/lib/customer/session";
import { prisma } from "@/lib/prisma";
import {
  publicProfile,
  readCustomerProfile,
} from "@/lib/panel/customer-profile";

function deviceFromUa(ua: string | null) {
  const value = (ua ?? "").toLowerCase();
  if (!value) return "unknown";
  if (/mobile|android|iphone|ipad/.test(value)) return "mobile";
  return "desktop";
}

export async function loadProfileSnapshot(user: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  passwordHash: string | null;
  createdAt: Date;
}) {
  const [profile, oauth, sessions] = await Promise.all([
    readCustomerProfile(user.id),
    prisma.customerOAuthAccount.findMany({
      where: { userId: user.id },
      select: { provider: true },
    }),
    prisma.customerSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const jar = await cookies();
  const current = await verifyCustomerJwt(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  const currentHash = current ? hashToken(current.sid) : null;

  return {
    user: {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      image: user.image,
      hasPassword: Boolean(user.passwordHash),
      createdAt: user.createdAt.toISOString(),
    },
    profile: publicProfile(profile),
    oauth: oauth.map((row) => row.provider),
    sessions: sessions.map((row) => ({
      id: row.id,
      current: row.tokenHash === currentHash,
      device: deviceFromUa(row.userAgent),
      location: row.ipAddress || "—",
      userAgent: row.userAgent || "—",
      createdAt: row.createdAt.toISOString(),
      loginType: oauth.length ? "oauth" : "email",
    })),
  };
}
