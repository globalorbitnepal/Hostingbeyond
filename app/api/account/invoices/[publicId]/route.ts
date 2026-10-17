import { NextResponse } from "next/server";

import { getCustomerInvoiceDetail } from "@/lib/billing/customer-invoices";
import { requireCustomerSession } from "@/lib/domains/require-customer";

export const runtime = "nodejs";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_request: Request, context: Params) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { publicId } = await context.params;
  const invoice = await getCustomerInvoiceDetail(user.id, publicId);
  if (!invoice) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ invoice });
}
