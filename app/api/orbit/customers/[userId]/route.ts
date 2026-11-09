import { NextResponse } from "next/server";

import { requireOrbitFullAdmin } from "@/lib/orbit/api";
import { getOrbitCustomerDetail } from "@/lib/orbit/customer-directory";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await context.params;
  const detail = await getOrbitCustomerDetail(userId);
  if (!detail) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { user, summary, lastSignIn } = detail;

  return NextResponse.json({
    customer: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      hasPassword: Boolean(user.passwordHash),
      signupMethods: summary.signupMethods,
      lastSignIn,
      wallet: user.wallet
        ? {
            balance: Number(user.wallet.balance),
            currency: user.wallet.currency,
          }
        : null,
      oauthAccounts: user.accounts.map((a) => ({
        provider: a.provider,
        providerAccountId: a.providerAccountId,
        linkedAt: a.createdAt.toISOString(),
      })),
      sessions: user.sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
      })),
      hostingOrders: user.hostingOrders.map((o) => ({
        ...o,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString() ?? null,
      })),
      domainOrders: user.domainOrders.map((o) => ({
        ...o,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
      })),
      walletPayments: user.walletPayments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        createdAt: p.createdAt.toISOString(),
      })),
      walletTransactions: user.walletTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        balanceAfter: t.balanceAfter == null ? null : Number(t.balanceAfter),
        createdAt: t.createdAt.toISOString(),
      })),
      beyondAi: user.beyondAi,
      summary: {
        hostingSpend: summary.hostingSpend,
        domainSpend: summary.domainSpend,
        walletTopUps: summary.walletTopUps,
      },
    },
  });
}
