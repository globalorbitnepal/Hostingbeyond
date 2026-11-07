import { NextResponse } from "next/server";

import { voidInvoiceAsAdmin } from "@/lib/billing/admin-invoices";
import { orbitAdminMutationError } from "@/lib/http/safe-api-error";
import { requireOrbitFullAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

type Params = { params: Promise<{ invoiceId: string }> };

export async function POST(request: Request, context: Params) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { invoiceId } = await context.params;
  let body: { reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const reason = body.reason?.trim();
  if (!reason || reason.length < 3) {
    return NextResponse.json({ error: "Reason required." }, { status: 400 });
  }
  try {
    const invoice = await voidInvoiceAsAdmin({
      invoiceId,
      adminUserId: admin.id,
      reason,
    });
    return NextResponse.json({
      ok: true,
      invoice: {
        id: invoice.id,
        status: invoice.status,
        voidedAt: invoice.voidedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    const { error: message, status } = orbitAdminMutationError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
