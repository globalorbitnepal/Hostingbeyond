import { prisma } from "@/lib/prisma";

import { voidRejectionReason } from "@/lib/billing/invoice-void-policy";

export async function searchAdminInvoices(input: {
  invoiceNumber?: string;
  customerEmail?: string;
  domainOrderPublicId?: string;
  limit: number;
}) {
  const where: Record<string, unknown> = {};
  if (input.invoiceNumber?.trim()) {
    where.invoiceNumber = {
      contains: input.invoiceNumber.trim(),
      mode: "insensitive",
    };
  }
  if (input.customerEmail?.trim()) {
    where.user = {
      email: { contains: input.customerEmail.trim(), mode: "insensitive" },
    };
  }
  if (input.domainOrderPublicId?.trim()) {
    where.domainOrder = { publicId: input.domainOrderPublicId.trim() };
  }
  return prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: input.limit,
    include: {
      user: { select: { email: true, name: true } },
      domainOrder: { select: { publicId: true, domain: true } },
      creditNotes: { orderBy: { issuedAt: "desc" }, take: 5 },
    },
  });
}

export async function voidInvoiceAsAdmin(input: {
  invoiceId: string;
  adminUserId: string;
  reason: string;
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: input.invoiceId },
  });
  if (!invoice) throw new Error("invoice_not_found");

  if (invoice.status === "VOID") {
    return invoice;
  }

  const reject = voidRejectionReason(invoice.status);
  if (reject) {
    throw new Error(reject);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.invoice.updateMany({
      where: { id: invoice.id, status: "ISSUED" },
      data: {
        status: "VOID",
        voidedAt: new Date(),
        voidReason: input.reason.slice(0, 500),
      },
    });
    if (result.count === 0) {
      const current = await tx.invoice.findUnique({
        where: { id: invoice.id },
      });
      if (!current) throw new Error("invoice_not_found");
      const again = voidRejectionReason(current.status);
      throw new Error(again ?? "void_not_allowed");
    }
    return tx.invoice.findUniqueOrThrow({ where: { id: invoice.id } });
  });

  await prisma.activityLog.create({
    data: {
      adminUserId: input.adminUserId,
      action: "INVOICE_VOID",
      resource: invoice.invoiceNumber,
      details: input.reason.slice(0, 2000),
    },
  });
  return updated;
}
