import { prisma } from "@/lib/prisma";

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
  if (invoice.status === "VOID") return invoice;
  if (invoice.status === "DRAFT") {
    throw new Error("void_not_allowed_for_draft");
  }
  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "VOID",
      voidedAt: new Date(),
      voidReason: input.reason.slice(0, 500),
    },
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
