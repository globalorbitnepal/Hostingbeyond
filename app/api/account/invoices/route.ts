import { NextResponse } from "next/server";

import { listCustomerInvoices } from "@/lib/billing/customer-invoices";
import { requireCustomerSession } from "@/lib/domains/require-customer";
import { parseLimitQuery } from "@/lib/http/clamp-list-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const url = new URL(request.url);
  const limit = parseLimitQuery(url.searchParams.get("limit"), 25, 100);
  const status = url.searchParams.get("status")?.trim() || undefined;
  try {
    const invoices = await listCustomerInvoices(user.id, limit, status);
    return NextResponse.json({ invoices });
  } catch {
    return NextResponse.json(
      { error: "Could not load invoices." },
      { status: 503 },
    );
  }
}
