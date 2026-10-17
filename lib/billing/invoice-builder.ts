import { Prisma } from "@prisma/client";

import { allocateInvoiceNumber } from "@/lib/billing/invoice-number";
import { buildMinimalInvoicePdf } from "@/lib/billing/invoice-pdf";
import {
  invoicePdfStorageKey,
  writeInvoicePdf,
} from "@/lib/billing/invoice-storage";
import { reconcileInvoicePaymentForOrder } from "@/lib/billing/reconcile-invoice-payment";
import { deriveTaxSnapshotFromOrder } from "@/lib/billing/tax-snapshot";
import { prisma } from "@/lib/prisma";

const BILLABLE_ORDER_STATUSES = new Set(["REGISTERED"]);

function orderLineDescription(order: {
  orderType: string;
  domain: string;
  tld: string;
}): string {
  const kind =
    order.orderType === "renew"
      ? "Domain renewal"
      : order.orderType === "transfer"
        ? "Domain transfer"
        : "Domain registration";
  return `${kind}: ${order.domain}`;
}

function newPublicId(): string {
  return `inv_${crypto.randomUUID().replace(/-/g, "")}`;
}

export type IssueInvoiceResult =
  | { ok: true; invoiceId: string; publicId: string; created: boolean }
  | { ok: false; reason: string };

/**
 * Idempotent: one invoice per domain order (unique domainOrderId + sourceType/sourceId).
 */
export async function issueInvoiceForDomainOrder(
  domainOrderId: string,
): Promise<IssueInvoiceResult> {
  const order = await prisma.domainOrder.findUnique({
    where: { id: domainOrderId },
  });
  if (!order) return { ok: false, reason: "order_not_found" };
  if (!order.userId) return { ok: false, reason: "order_missing_user" };
  if (!BILLABLE_ORDER_STATUSES.has(order.status)) {
    return { ok: false, reason: "order_not_billable" };
  }

  const existing = await prisma.invoice.findUnique({
    where: { domainOrderId },
  });
  if (existing) {
    await ensureInvoicePdf(existing.id);
    const reconciled = await reconcileInvoicePaymentForOrder(
      existing,
      domainOrderId,
    );
    return {
      ok: true,
      invoiceId: reconciled.id,
      publicId: reconciled.publicId,
      created: false,
    };
  }

  const tax = deriveTaxSnapshotFromOrder({
    retailPrice: order.retailPrice,
    discount: order.discount,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
  });

  try {
    const created = await prisma.$transaction(async (tx) => {
      const dup = await tx.invoice.findFirst({
        where: {
          sourceType: "DOMAIN_ORDER",
          sourceId: domainOrderId,
        },
      });
      if (dup) return dup;

      const invoiceNumber = await allocateInvoiceNumber(tx);
      const invoice = await tx.invoice.create({
        data: {
          publicId: newPublicId(),
          invoiceNumber,
          userId: order.userId!,
          status: "ISSUED",
          currency: order.currency,
          subtotal: tax.subtotal,
          discount: tax.discount,
          tax: tax.tax,
          total: tax.total,
          taxTreatment: tax.taxTreatment,
          taxRatePercent: tax.taxRatePercent,
          sourceType: "DOMAIN_ORDER",
          sourceId: domainOrderId,
          domainOrderId,
          issuedAt: new Date(),
          lineItems: {
            create: [
              {
                description: orderLineDescription(order),
                quantity: new Prisma.Decimal(1),
                unitAmount: tax.subtotal,
                lineSubtotal: tax.subtotal,
                lineTax: tax.tax,
                lineTotal: tax.total,
                referenceType: "domain_order",
                referenceId: domainOrderId,
                sortOrder: 0,
              },
            ],
          },
        },
        include: { lineItems: true },
      });
      return invoice;
    });

    let reconciled = await reconcileInvoicePaymentForOrder(
      created,
      domainOrderId,
    );
    await ensureInvoicePdf(reconciled.id);
    reconciled = await prisma.invoice.findUniqueOrThrow({
      where: { id: reconciled.id },
    });

    return {
      ok: true,
      invoiceId: reconciled.id,
      publicId: reconciled.publicId,
      created: true,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const again = await prisma.invoice.findUnique({
        where: { domainOrderId },
      });
      if (again) {
        return {
          ok: true,
          invoiceId: again.id,
          publicId: again.publicId,
          created: false,
        };
      }
    }
    throw error;
  }
}

async function ensureInvoicePdf(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!invoice || invoice.status === "VOID") return;
  if (invoice.pdfStorageKey && invoice.pdfSha256) return;

  const bytes = buildMinimalInvoicePdf({
    invoice,
    lineItems: invoice.lineItems,
  });
  const key = invoicePdfStorageKey(invoice.id);
  const { sha256, storageKey } = await writeInvoicePdf(key, bytes);
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfStorageKey: storageKey, pdfSha256: sha256 },
  });
}
