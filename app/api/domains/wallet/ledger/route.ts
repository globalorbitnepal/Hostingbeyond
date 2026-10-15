import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { parseLimitQuery } from "@/lib/http/clamp-list-limit";
import { loadBillingLedgerForUser } from "@/lib/panel/load-billing-ledger";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseLimitQuery(url.searchParams.get("limit"), 100, 200);

  try {
    const entries = await loadBillingLedgerForUser(user.id, limit);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json(
      { error: "Could not load your transaction history." },
      { status: 503 },
    );
  }
}
