import { NextResponse } from "next/server";

import { listCustomerDomainOrders } from "@/lib/domains/customer-domain-orders";
import { requireCustomerSession } from "@/lib/domains/require-customer";
import { parseLimitQuery } from "@/lib/http/clamp-list-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseLimitQuery(url.searchParams.get("limit"), 50, 100);

  try {
    const orders = await listCustomerDomainOrders(user.id, limit);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json(
      { error: "Could not load your orders." },
      { status: 503 },
    );
  }
}
