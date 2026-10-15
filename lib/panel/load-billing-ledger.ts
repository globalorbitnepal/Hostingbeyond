import {
  buildBillingLedgerEntries,
  loadOrderPublicIdsForTransactions,
} from "@/lib/panel/billing-ledger";
import { clampListLimit } from "@/lib/http/clamp-list-limit";
import { listWalletTransactionsForUser } from "@/lib/payments/wallet-payment-service";
import { prisma } from "@/lib/prisma";

export async function loadBillingLedgerForUser(userId: string, limit = 100) {
  const take = clampListLimit(limit, 100, 200);
  const transactions = await listWalletTransactionsForUser(userId, take);
  const orderMap = await loadOrderPublicIdsForTransactions(
    transactions,
    userId,
    async (ids, uid) =>
      prisma.domainOrder.findMany({
        where: { id: { in: ids }, userId: uid },
        select: { id: true, publicId: true },
      }),
  );
  return buildBillingLedgerEntries(transactions, orderMap);
}
