import { NextResponse } from "next/server";

import { readInvoicePdf } from "@/lib/billing/invoice-storage";
import { requireCustomerSession } from "@/lib/domains/require-customer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_request: Request, context: Params) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { publicId } = await context.params;
  const invoice = await prisma.invoice.findFirst({
    where: { userId: user.id, publicId },
    select: {
      pdfStorageKey: true,
      invoiceNumber: true,
      status: true,
    },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (invoice.status === "VOID" || invoice.status === "DRAFT") {
    return NextResponse.json({ error: "Not available." }, { status: 403 });
  }
  if (!invoice.pdfStorageKey) {
    return NextResponse.json({ error: "PDF not ready." }, { status: 404 });
  }
  try {
    const bytes = await readInvoicePdf(invoice.pdfStorageKey);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF unavailable." }, { status: 404 });
  }
}
