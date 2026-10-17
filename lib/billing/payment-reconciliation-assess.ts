import type { Invoice, Prisma, WalletTransaction } from "@prisma/client";

import { decimal, moneyEquals, roundMoney } from "@/lib/billing/money";

export type OrderPaymentContext = {
  id: string;
  userId: string | null;
  total: Prisma.Decimal;
  currency: string;
  walletTransactionId: string | null;
};

export type ReconciliationAssessment =
  { markPaid: true } | { markPaid: false; reason: string };

export function assessWalletPaymentForInvoice(input: {
  invoice: Pick<Invoice, "status" | "userId" | "total" | "currency">;
  order: OrderPaymentContext | null;
  walletTx: WalletTransaction | null;
}): ReconciliationAssessment {
  const { invoice, order, walletTx } = input;

  if (invoice.status === "PAID" || invoice.status === "VOID") {
    return { markPaid: false, reason: "invoice_terminal_status" };
  }
  if (!order?.walletTransactionId) {
    return { markPaid: false, reason: "order_missing_wallet_link" };
  }
  if (!order.userId) {
    return { markPaid: false, reason: "order_missing_user" };
  }
  if (order.userId !== invoice.userId) {
    return { markPaid: false, reason: "order_user_mismatch" };
  }
  if (walletTx?.id !== order.walletTransactionId) {
    return { markPaid: false, reason: "wallet_tx_not_linked" };
  }
  if (!walletTx) {
    return { markPaid: false, reason: "wallet_tx_missing" };
  }
  if (walletTx.userId !== invoice.userId) {
    return { markPaid: false, reason: "wallet_tx_user_mismatch" };
  }
  if (walletTx.status !== "COMPLETED") {
    return { markPaid: false, reason: "wallet_tx_not_completed" };
  }
  if (walletTx.type === "RESERVE") {
    return { markPaid: false, reason: "wallet_tx_reserve_not_captured" };
  }
  if (walletTx.type !== "DEBIT") {
    return { markPaid: false, reason: "wallet_tx_not_debit" };
  }
  if (
    walletTx.referenceType !== "DomainOrder" ||
    walletTx.referenceId !== order.id
  ) {
    return { markPaid: false, reason: "wallet_tx_order_reference_mismatch" };
  }

  const invoiceTotal = roundMoney(decimal(invoice.total));
  const orderTotal = roundMoney(decimal(order.total));
  if (!moneyEquals(invoiceTotal, orderTotal)) {
    return { markPaid: false, reason: "invoice_order_total_mismatch" };
  }

  const txAmount = roundMoney(decimal(walletTx.amount));
  if (!moneyEquals(txAmount, invoiceTotal)) {
    return { markPaid: false, reason: "wallet_tx_amount_mismatch" };
  }

  const invCurrency = invoice.currency.trim().toUpperCase();
  const orderCurrency = order.currency.trim().toUpperCase();
  const txCurrency = walletTx.currency.trim().toUpperCase();
  if (invCurrency !== orderCurrency || invCurrency !== txCurrency) {
    return { markPaid: false, reason: "currency_mismatch" };
  }

  return { markPaid: true };
}
