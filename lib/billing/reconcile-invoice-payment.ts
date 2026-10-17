import type { Invoice, Prisma } from "@prisma/client";

import { assessWalletPaymentForInvoice } from "@/lib/billing/payment-reconciliation-assess";
import { prisma } from "@/lib/prisma";

export type ReconcileInvoicePaymentResult = {
  invoice: Invoice;
  markedPaid: boolean;
  skipReason?: string;
};

/** Mark invoice paid only when wallet debit matches invoice and order snapshots. */
export async function reconcileInvoicePaymentForOrder(
  invoice: Invoice,
  domainOrderId: string,
  tx?: Prisma.TransactionClient,
): Promise<Invoice> {
  const result = await reconcileInvoicePaymentDetailed(
    invoice,
    domainOrderId,
    tx,
  );
  return result.invoice;
}

export async function reconcileInvoicePaymentDetailed(
  invoice: Invoice,
  domainOrderId: string,
  tx?: Prisma.TransactionClient,
): Promise<ReconcileInvoicePaymentResult> {
  const db = tx ?? prisma;

  if (invoice.status === "PAID") {
    return { invoice, markedPaid: false, skipReason: "already_paid" };
  }
  if (invoice.status === "VOID") {
    return { invoice, markedPaid: false, skipReason: "invoice_void" };
  }

  const order = await db.domainOrder.findUnique({
    where: { id: domainOrderId },
    select: {
      id: true,
      userId: true,
      total: true,
      currency: true,
      walletTransactionId: true,
    },
  });

  const walletTx = order?.walletTransactionId
    ? await db.walletTransaction.findUnique({
        where: { id: order.walletTransactionId },
      })
    : null;

  const assessment = assessWalletPaymentForInvoice({
    invoice,
    order,
    walletTx,
  });

  if (!assessment.markPaid) {
    return {
      invoice,
      markedPaid: false,
      skipReason: assessment.reason,
    };
  }

  const updated = await db.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      walletTransactionId: walletTx!.id,
    },
  });
  return { invoice: updated, markedPaid: true };
}
