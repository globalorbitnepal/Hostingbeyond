import type { WalletTransaction } from "@prisma/client";

export type BillingLedgerEntry = {
  id: string;
  createdAt: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  balanceAfter: number | null;
  description: string;
  domainOrderPublicId: string | null;
};

export type DomainOrderPublicIdMap = Record<string, string>;

function describeWalletTransaction(row: WalletTransaction): string {
  const note = row.note?.trim();
  if (note) return note;
  switch (row.type) {
    case "CREDIT":
      return row.referenceType === "WalletPayment"
        ? "Wallet top-up"
        : "Wallet credit";
    case "DEBIT":
      return "Domain purchase";
    case "RESERVE":
      return "Funds reserved for domain checkout";
    case "RELEASE":
      return "Reserved funds released";
    case "REFUND":
      return "Refund to wallet";
    default:
      return row.type;
  }
}

export function buildBillingLedgerEntries(
  transactions: WalletTransaction[],
  orderPublicIdsByOrderId: DomainOrderPublicIdMap = {},
): BillingLedgerEntry[] {
  const seen = new Set<string>();
  const entries: BillingLedgerEntry[] = [];

  for (const row of transactions) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);

    let domainOrderPublicId: string | null = null;
    if (row.referenceType === "DomainOrder" && row.referenceId) {
      domainOrderPublicId = orderPublicIdsByOrderId[row.referenceId] ?? null;
    }

    entries.push({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      type: row.type,
      status: row.status,
      amount: Number(row.amount),
      currency: row.currency,
      balanceAfter: row.balanceAfter != null ? Number(row.balanceAfter) : null,
      description: describeWalletTransaction(row),
      domainOrderPublicId,
    });
  }

  return entries;
}

export async function loadOrderPublicIdsForTransactions(
  transactions: WalletTransaction[],
  userId: string,
  findOrders: (
    ids: string[],
    uid: string,
  ) => Promise<Array<{ id: string; publicId: string }>>,
): Promise<DomainOrderPublicIdMap> {
  const orderIds = [
    ...new Set(
      transactions
        .filter(
          (t) => t.referenceType === "DomainOrder" && t.referenceId != null,
        )
        .map((t) => t.referenceId as string),
    ),
  ];
  if (!orderIds.length) return {};
  const orders = await findOrders(orderIds, userId);
  const map: DomainOrderPublicIdMap = {};
  for (const o of orders) {
    map[o.id] = o.publicId;
  }
  return map;
}
