import { NextResponse } from "next/server";

import { requireOrbitFullAdmin } from "@/lib/orbit/api";
import {
  orbitCustomerDirectoryStats,
  resolveSignupMethods,
  searchOrbitCustomers,
} from "@/lib/orbit/customer-directory";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  const [stats, rows] = await Promise.all([
    orbitCustomerDirectoryStats(),
    searchOrbitCustomers(q),
  ]);

  return NextResponse.json({
    stats,
    customers: rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      image: row.image,
      createdAt: row.createdAt.toISOString(),
      walletBalance: row.wallet ? Number(row.wallet.balance) : 0,
      walletCurrency: row.wallet?.currency ?? "USD",
      signupMethods: resolveSignupMethods({
        passwordHash: row.passwordHash,
        providers: row.accounts.map((a) => a.provider),
      }),
      oauthProviders: row.accounts.map((a) => a.provider),
      counts: row._count,
    })),
  });
}
