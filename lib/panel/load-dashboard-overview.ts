import { listCustomerDomains } from "@/lib/domains/registration-service";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import { listHostingOrdersForUser } from "@/lib/hosting/hosting-orders";
import { countCustomerMigrationRequests } from "@/lib/migration/customer-migration-requests";
import { prisma } from "@/lib/prisma";

import { domainHealth, summarizeDomains } from "./domain-status";

export type DashboardDomain = {
  domain: string;
  status: string;
  expiresAt: Date | null;
  registeredAt: Date | null;
  autoRenew: boolean;
  renewalPrice: number | null;
  currency: string;
};

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
  domains: DashboardDomain[];
  /** Domains needing the customer's attention, most urgent first. */
  attentionDomains: DashboardDomain[];
  domainSummary: ReturnType<typeof summarizeDomains>;
  counts: {
    hostingOrdersTotal: number;
    activeDomains: number;
    hostingOrdersActive: number;
    migrationRequests: number;
    beyondAiProjects: number;
    openInvoices: number;
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

  const [
    walletRow,
    orders,
    domainRows,
    migrations,
    beyondProjects,
    txns,
    openInvoices,
  ] = await Promise.all([
    ensureCustomerWallet(userId),
    listHostingOrdersForUser(userId),
    listCustomerDomains(userId).catch(() => []),
    countCustomerMigrationRequests(userId, user.email).catch(() => 0),
    prisma.beyondAiProject.count({ where: { userId } }).catch(() => 0),
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
    prisma.invoice
      .count({
        where: {
          userId,
          status: "ISSUED",
        },
      })
      .catch(() => 0),
  ]);

  const domains: DashboardDomain[] = domainRows.map((row) => ({
    domain: row.domain,
    status: row.status,
    expiresAt: row.expiresAt ?? null,
    registeredAt: row.registeredAt ?? null,
    autoRenew: row.autoRenew,
    renewalPrice: row.renewalPrice ?? null,
    currency: row.currency ?? "USD",
  }));

  const summary = summarizeDomains(domains);

  /**
   * Urgency order: expired first (revenue + reputation risk), then critical,
   * then expiring. Healthy and pending domains need no action from the customer.
   */
  const urgency = { expired: 0, critical: 1, expiring: 2 } as const;
  const attentionDomains = domains
    .filter((domain) => {
      const health = domainHealth(domain.status, domain.expiresAt);
      return (
        health === "expired" || health === "critical" || health === "expiring"
      );
    })
    .sort((a, b) => {
      const ha = domainHealth(a.status, a.expiresAt) as keyof typeof urgency;
      const hb = domainHealth(b.status, b.expiresAt) as keyof typeof urgency;
      return (urgency[ha] ?? 3) - (urgency[hb] ?? 3);
    });

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
    domains,
    attentionDomains,
    domainSummary: summary,
    counts: {
      hostingOrdersTotal: orders.length,
      activeDomains: summary.active,
      hostingOrdersActive,
      migrationRequests: migrations,
      beyondAiProjects: beyondProjects,
      openInvoices,
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
