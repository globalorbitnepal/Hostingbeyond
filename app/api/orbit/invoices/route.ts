import { NextResponse } from "next/server";

import { searchAdminInvoices } from "@/lib/billing/admin-invoices";
import { requireOrbitAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? "50"), 1),
    100,
  );
  const rows = await searchAdminInvoices({
    invoiceNumber: url.searchParams.get("invoiceNumber") ?? undefined,
    customerEmail: url.searchParams.get("email") ?? undefined,
    domainOrderPublicId: url.searchParams.get("orderPublicId") ?? undefined,
    limit,
  });
  return NextResponse.json({
    rows: rows.map((row) => ({
      id: row.id,
      publicId: row.publicId,
      invoiceNumber: row.invoiceNumber,
      status: row.status,
      total: row.total.toFixed(2),
      currency: row.currency,
      user: row.user,
      domainOrder: row.domainOrder,
      creditNotes: row.creditNotes.map((cn) => ({
        creditNoteNumber: cn.creditNoteNumber,
        amount: cn.amount.toFixed(2),
        issuedAt: cn.issuedAt.toISOString(),
      })),
    })),
  });
}
