import { NextResponse } from "next/server";

import { ensureCustomerWallet } from "@/lib/domains/wallet";
import { requireCustomerSession } from "@/lib/domains/require-customer";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const wallet = await ensureCustomerWallet(user.id);
    return NextResponse.json({
      balance: Number(wallet.balance),
      currency: wallet.currency,
    });
  } catch {
    return NextResponse.json(
      { error: "Wallet is temporarily unavailable." },
      { status: 503 },
    );
  }
}
