import { Prisma } from "@prisma/client";

import { hashPassword } from "@/lib/customer/password";
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

export async function searchOrbitCustomers(query: string, limit = 40) {
  const q = query.trim();
  return prisma.customerUser.findMany({
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
    include: {
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
    },
  });
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
        take: 15,
        select: {
          id: true,
          amount: true,
          currency: true,
          type: true,
          note: true,
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
        action: "CUSTOMER_PASSWORD_RESET",
        resource: `CustomerUser:${input.userId}`,
        details: JSON.stringify({ via: "orbit_admin" }),
      },
    }),
  ]);
}
