import { Prisma } from "@prisma/client";

import { hashPassword } from "@/lib/customer/password";
import { latestSignInByUserId } from "@/lib/customer/signin-activity";
import { prisma } from "@/lib/prisma";

export function resolveSignupMethods(input: {
  passwordHash: string | null;
  providers: string[];
}): string[] {
  const methods: string[] = [];
  if (input.passwordHash) methods.push("email");
  for (const provider of input.providers) {
    if (!methods.includes(provider)) methods.push(provider);
  }
  return methods.length ? methods : ["unknown"];
}

export async function orbitCustomerDirectoryStats() {
  const [totalCustomers, emailPasswordUsers, oauthRows, walletFunded] =
    await Promise.all([
      prisma.customerUser.count(),
      prisma.customerUser.count({
        where: { passwordHash: { not: null } },
      }),
      prisma.customerOAuthAccount.groupBy({
        by: ["provider"],
        _count: { _all: true },
      }),
      prisma.customerWallet.count({
        where: { balance: { gt: new Prisma.Decimal(0) } },
      }),
    ]);

  const oauthByProvider = Object.fromEntries(
    oauthRows.map((row) => [row.provider, row._count._all]),
  );

  return {
    totalCustomers,
    emailPasswordUsers,
    oauthByProvider,
    walletsWithBalance: walletFunded,
  };
}

const countryDisplay = new Intl.DisplayNames(["en"], { type: "region" });

/** Matches a search term against an ISO country code or its English name. */
function countryMatches(term: string, code: string | null | undefined) {
  if (!code) return false;
  const needle = term.trim().toLowerCase();
  if (!needle) return false;
  if (code.toLowerCase() === needle) return true;
  try {
    return (countryDisplay.of(code) ?? "").toLowerCase().includes(needle);
  } catch {
    return false;
  }
}

const customerInclude = {
  wallet: true,
  accounts: { select: { provider: true, createdAt: true } },
  _count: {
    select: {
      sessions: true,
      hostingOrders: true,
      domainOrders: true,
      walletPayments: true,
    },
  },
} as const;

/**
 * Country lives in the sign-in audit trail (a JSON detail string), so it cannot
 * be filtered in SQL against CustomerUser. We resolve matching customer ids from
 * recent LOGIN rows and then load those customers.
 */
async function customerIdsByCountry(term: string, limit: number) {
  const rows = await prisma.activityLog.findMany({
    where: { action: "LOGIN" },
    orderBy: { createdAt: "desc" },
    take: 800,
    select: { resource: true, details: true },
  });
  const ids: string[] = [];
  for (const row of rows) {
    const userId = row.resource?.replace("CustomerUser:", "");
    if (!userId || ids.includes(userId)) continue;
    let code: string | null = null;
    try {
      const parsed = row.details
        ? (JSON.parse(row.details) as Record<string, unknown>)
        : {};
      code = typeof parsed.country === "string" ? parsed.country : null;
    } catch {
      code = null;
    }
    if (countryMatches(term, code)) ids.push(userId);
    if (ids.length >= limit) break;
  }
  return ids;
}

export async function searchOrbitCustomers(query: string, limit = 40) {
  const q = query.trim();

  const rows = await prisma.customerUser.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: customerInclude,
  });

  let merged = rows;
  if (q) {
    const countryIds = await customerIdsByCountry(q, limit);
    const missing = countryIds.filter(
      (id) => !rows.some((row) => row.id === id),
    );
    if (missing.length > 0) {
      const extra = await prisma.customerUser.findMany({
        where: { id: { in: missing } },
        orderBy: { createdAt: "desc" },
        include: customerInclude,
      });
      merged = [...rows, ...extra];
    }
  }

  const signIns = await latestSignInByUserId(merged.map((row) => row.id));
  return merged.map((row) => ({
    ...row,
    lastSignIn: signIns.get(row.id) ?? null,
  }));
}

export async function getOrbitCustomerDetail(userId: string) {
  const user = await prisma.customerUser.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      accounts: { orderBy: { createdAt: "asc" } },
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
          userAgent: true,
          ipAddress: true,
        },
      },
      hostingOrders: {
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          status: true,
          productSlug: true,
          planKey: true,
          total: true,
          currency: true,
          createdAt: true,
          paidAt: true,
        },
      },
      domainOrders: {
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          status: true,
          total: true,
          currency: true,
          createdAt: true,
        },
      },
      walletPayments: {
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          publicId: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      },
      walletTransactions: {
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          amount: true,
          currency: true,
          type: true,
          status: true,
          balanceAfter: true,
          note: true,
          referenceType: true,
          createdAt: true,
        },
      },
      beyondAi: {
        select: {
          planId: true,
          status: true,
          monthlyCreditUsd: true,
          creditRemainingUsd: true,
        },
      },
    },
  });

  if (!user) return null;

  const signIns = await latestSignInByUserId([userId]);

  const hostingSpend = user.hostingOrders.reduce(
    (sum, row) => sum + Number(row.total),
    0,
  );
  const domainSpend = user.domainOrders.reduce(
    (sum, row) => sum + Number(row.total),
    0,
  );
  const walletTopUps = user.walletPayments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, row) => sum + Number(row.amount), 0);

  return {
    user,
    lastSignIn: signIns.get(userId) ?? null,
    summary: {
      hostingSpend,
      domainSpend,
      walletTopUps,
      signupMethods: resolveSignupMethods({
        passwordHash: user.passwordHash,
        providers: user.accounts.map((a) => a.provider),
      }),
    },
  };
}

export async function orbitAdminResetCustomerPassword(input: {
  adminUserId: string;
  userId: string;
  newPassword: string;
}) {
  if (input.newPassword.trim().length < 8) {
    throw new Error("password_too_short");
  }
  const passwordHash = await hashPassword(input.newPassword.trim());
  await prisma.$transaction([
    prisma.customerUser.update({
      where: { id: input.userId },
      data: { passwordHash },
    }),
    prisma.activityLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: "SETTINGS_UPDATE",
        resource: `CustomerUser:${input.userId}`,
        details: JSON.stringify({
          via: "orbit_admin",
          kind: "customer_password_reset",
        }),
      },
    }),
  ]);
}
