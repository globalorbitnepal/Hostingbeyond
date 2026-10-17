import { listCustomerDomains } from "@/lib/domains/registration-service";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import { listHostingOrdersForUser } from "@/lib/hosting/hosting-orders";
import { countCustomerMigrationRequests } from "@/lib/migration/customer-migration-requests";
import { prisma } from "@/lib/prisma";

export type DashboardOverview = {
  user: { name: string | null; email: string; image: string | null };
  wallet: { balance: number; currency: string };
  orders: Array<{
    id: string;
    status: string;
    productSlug: string;
    planKey: string;
    total: number;
    currency: string;
    billingCycle: string;
    createdAt: Date;
    planName: string | null;
  }>;
  domains: Array<{
    domain: string;
    status: string;
    expiresAt: Date | null;
    autoRenew: boolean;
  }>;
  counts: {
    hostingOrdersTotal: number;
    activeDomains: number;
    hostingOrdersActive: number;
    migrationRequests: number;
    beyondAiProjects: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    createdAt: Date;
    note: string | null;
  }>;
};

export async function loadDashboardOverview(
  userId: string,
): Promise<DashboardOverview> {
  const user = await prisma.customerUser.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true },
  });
  if (!user) {
    throw new Error("user_not_found");
  }

  const [walletRow, orders, domains, migrations, beyondProjects, txns] =
    await Promise.all([
      ensureCustomerWallet(userId),
      listHostingOrdersForUser(userId),
      listCustomerDomains(userId).catch(() => []),
      countCustomerMigrationRequests(userId, user.email),
      prisma.beyondAiProject.count({ where: { userId } }),
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          createdAt: true,
          note: true,
        },
      }),
    ]);

  const activeDomains = domains.filter((d) => d.status === "ACTIVE").length;
  const hostingOrdersActive = orders.filter(
    (o) => o.status === "ACTIVE" || o.status === "PROVISIONING",
  ).length;

  return {
    user,
    wallet: {
      balance: Number(walletRow.balance),
      currency: walletRow.currency,
    },
    orders: orders.slice(0, 6).map((o) => {
      const snap = o.lineItemsSnapshot as { planName?: string } | null;
      return {
        id: o.id,
        status: o.status,
        productSlug: o.productSlug,
        planKey: o.planKey,
        total: Number(o.total),
        currency: o.currency,
        billingCycle: o.billingCycle,
        createdAt: o.createdAt,
        planName: snap?.planName ?? null,
      };
    }),
    domains: domains.slice(0, 6).map((d) => ({
      domain: d.domain,
      status: d.status,
      expiresAt: d.expiresAt,
      autoRenew: d.autoRenew,
    })),
    counts: {
      hostingOrdersTotal: orders.length,
      activeDomains,
      hostingOrdersActive,
      migrationRequests: migrations,
      beyondAiProjects: beyondProjects,
    },
    recentTransactions: txns.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      currency: t.currency,
      createdAt: t.createdAt,
      note: t.note,
    })),
  };
}
