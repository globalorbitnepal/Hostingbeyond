import { prisma } from "@/lib/prisma";
import type {
  AccountReader,
  DomainRecord,
  HostingRecord,
  InvoiceRecord,
  PaymentRecord,
  TransactionRecord,
} from "@/lib/beyond-master/account/read";

const SPEC_FIELDS = [
  ["storage", "Storage"],
  ["bandwidth", "Bandwidth"],
  ["websites", "Websites"],
  ["databases", "Databases"],
  ["emailAccounts", "Email accounts"],
  ["backup", "Backup"],
] as const;

export const prismaAccountReader: AccountReader = {
  async domains(userId, skip, take) {
    const rows = await prisma.domainRegistration.findMany({
      where: { userId },
      orderBy: [{ expiresAt: "asc" }, { domain: "asc" }],
      skip,
      take,
      select: {
        domain: true,
        status: true,
        registeredAt: true,
        expiresAt: true,
        nameservers: true,
      },
    });
    return rows.map((row): DomainRecord => ({
      name: row.domain,
      status: row.status,
      registeredAt: row.registeredAt?.toISOString() ?? null,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      nameservers: row.nameservers,
    }));
  },
  async hosting(userId, skip, take) {
    const orders = await prisma.hostingOrder.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        productSlug: true,
        planKey: true,
        status: true,
        billingCycle: true,
        expiresAt: true,
        total: true,
        currency: true,
      },
    });
    const cards: HostingRecord[] = [];
    for (const order of orders) {
      const product = await prisma.hostingProduct.findUnique({
        where: { slug: order.productSlug },
        select: {
          name: true,
          plans: { where: { planKey: order.planKey }, take: 1 },
        },
      });
      const plan = product?.plans[0] ?? null;
      cards.push({
        productSlug: order.productSlug,
        productName: product?.name ?? null,
        planKey: order.planKey,
        planName: plan?.planName ?? null,
        status: order.status,
        billingCycle: order.billingCycle,
        expiresAt: order.expiresAt?.toISOString() ?? null,
        total: order.total.toFixed(2),
        currency: order.currency,
        ssl: plan?.ssl ?? null,
        specs: plan
          ? SPEC_FIELDS.flatMap(([key, label]) => {
              const value = plan[key];
              return value ? [{ label, value }] : [];
            })
          : [],
      });
    }
    return cards;
  },
  async invoices(userId, skip, take) {
    const rows = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        invoiceNumber: true,
        total: true,
        currency: true,
        status: true,
        dueAt: true,
        paidAt: true,
      },
    });
    return rows.map((row): InvoiceRecord => ({
      number: row.invoiceNumber,
      amount: row.total.toFixed(2),
      currency: row.currency,
      status: row.status,
      dueAt: row.dueAt?.toISOString() ?? null,
      paidAt: row.paidAt?.toISOString() ?? null,
    }));
  },
  async wallet(userId) {
    const row = await prisma.customerWallet.findUnique({
      where: { userId },
      select: { balance: true, currency: true },
    });
    if (!row) return null;
    return { balance: row.balance.toFixed(2), currency: row.currency };
  },
  async transactions(userId, skip, take) {
    const rows = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        type: true,
        status: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
    });
    return rows.map((row): TransactionRecord => ({
      type: row.type,
      status: row.status,
      amount: row.amount.toFixed(2),
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
    }));
  },
  async payments(userId, skip, take) {
    const rows = await prisma.walletPayment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        publicId: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
      },
    });
    return rows.map((row): PaymentRecord => ({
      reference: row.publicId,
      amount: row.amount.toFixed(2),
      currency: row.currency,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));
  },
};
