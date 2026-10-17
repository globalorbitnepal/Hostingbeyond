import type { Invoice, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Mark invoice paid when linked wallet capture exists and is completed. */
export async function reconcileInvoicePaymentForOrder(
  invoice: Invoice,
  domainOrderId: string,
  tx?: Prisma.TransactionClient,
): Promise<Invoice> {
  const db = tx ?? prisma;
  if (invoice.status === "PAID" || invoice.status === "VOID") {
    return invoice;
  }
  const order = await db.domainOrder.findUnique({
    where: { id: domainOrderId },
    select: { walletTransactionId: true },
  });
  if (!order?.walletTransactionId) {
    return invoice;
  }
  const walletTx = await db.walletTransaction.findUnique({
    where: { id: order.walletTransactionId },
  });
  if (
    !walletTx ||
    walletTx.status !== "COMPLETED" ||
    (walletTx.type !== "DEBIT" && walletTx.type !== "RESERVE")
  ) {
    return invoice;
  }
  if (walletTx.type === "RESERVE") {
    return invoice;
  }
  return db.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      walletTransactionId: walletTx.id,
    },
  });
}
