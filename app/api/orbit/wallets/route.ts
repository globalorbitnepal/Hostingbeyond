import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin } from "@/lib/orbit/api";
import {
  listWalletPaymentsForUser,
  listWalletTransactionsForUser,
  searchCustomersForWalletAdmin,
} from "@/lib/payments/wallet-payment-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const userId = url.searchParams.get("userId")?.trim() ?? "";

  if (userId) {
    const user = await prisma.customerUser.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }
    const [transactions, payments] = await Promise.all([
      listWalletTransactionsForUser(userId, 100),
      listWalletPaymentsForUser(userId, 50),
    ]);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.wallet ? Number(user.wallet.balance) : 0,
        currency: user.wallet?.currency ?? "USD",
      },
      transactions,
      payments,
    });
  }

  const customers = await searchCustomersForWalletAdmin(q);
  return NextResponse.json({
    customers: customers.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      balance: c.wallet ? Number(c.wallet.balance) : 0,
      currency: c.wallet?.currency ?? "USD",
    })),
  });
}
