import type { Invoice, InvoiceLineItem } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type CustomerInvoiceSummary = {
  publicId: string;
  invoiceNumber: string;
  status: string;
  currency: string;
  total: string;
  tax: string;
  taxTreatment: string;
  issuedAt: string | null;
  paidAt: string | null;
};

export type CustomerInvoiceDetail = CustomerInvoiceSummary & {
  subtotal: string;
  discount: string;
  taxRatePercent: string | null;
  lineItems: Array<{
    description: string;
    quantity: string;
    unitAmount: string;
    lineTotal: string;
    lineTax: string;
  }>;
  domainOrderPublicId: string | null;
};

function mapSummary(invoice: Invoice): CustomerInvoiceSummary {
  return {
    publicId: invoice.publicId,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    currency: invoice.currency,
    total: invoice.total.toFixed(2),
    tax: invoice.tax.toFixed(2),
    taxTreatment: invoice.taxTreatment,
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
  };
}

export async function listCustomerInvoices(
  userId: string,
  limit: number,
  status?: string,
) {
  const where: { userId: string; status?: Invoice["status"] } = { userId };
  if (status && ["DRAFT", "ISSUED", "PAID", "VOID"].includes(status)) {
    where.status = status as Invoice["status"];
  }
  const rows = await prisma.invoice.findMany({
    where,
    orderBy: { issuedAt: "desc" },
    take: limit,
  });
  return rows.map(mapSummary);
}

export async function getCustomerInvoiceDetail(
  userId: string,
  publicId: string,
): Promise<CustomerInvoiceDetail | null> {
  const invoice = await prisma.invoice.findFirst({
    where: { userId, publicId },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      domainOrder: { select: { publicId: true } },
    },
  });
  if (!invoice) return null;
  return {
    ...mapSummary(invoice),
    subtotal: invoice.subtotal.toFixed(2),
    discount: invoice.discount.toFixed(2),
    taxRatePercent: invoice.taxRatePercent?.toFixed(2) ?? null,
    lineItems: invoice.lineItems.map((line: InvoiceLineItem) => ({
      description: line.description,
      quantity: line.quantity.toFixed(2),
      unitAmount: line.unitAmount.toFixed(2),
      lineTotal: line.lineTotal.toFixed(2),
      lineTax: line.lineTax.toFixed(2),
    })),
    domainOrderPublicId: invoice.domainOrder?.publicId ?? null,
  };
}
