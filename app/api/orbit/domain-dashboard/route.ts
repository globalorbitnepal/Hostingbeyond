import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    customers,
    domains,
    activeDomains,
    pendingOrders,
    failedOrders,
    pendingTransfers,
    migrationsNew,
    providerErrors,
  ] = await Promise.all([
    prisma.customerUser.count(),
    prisma.domainRegistration.count(),
    prisma.domainRegistration.count({ where: { status: "ACTIVE" } }),
    prisma.domainOrder.count({
      where: {
        status: { in: ["PENDING_PAYMENT", "PROCESSING", "REGISTERING"] },
      },
    }),
    prisma.domainOrder.count({ where: { status: "FAILED" } }),
    prisma.domainTransferRecord.count({
      where: { status: { in: ["SUBMITTED", "IN_PROGRESS", "PAID"] } },
    }),
    prisma.migrationRequest.count({ where: { status: "NEW" } }),
    prisma.domainProviderLog.count({
      where: {
        success: false,
        createdAt: { gte: new Date(Date.now() - 86400000) },
      },
    }),
  ]);

  const revenueToday = await prisma.domainOrder.aggregate({
    where: {
      status: { in: ["REGISTERED", "PAID"] },
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    _sum: { total: true },
  });

  return NextResponse.json({
    customers,
    domains,
    activeDomains,
    pendingOrders,
    failedOrders,
    pendingTransfers,
    migrationsNew,
    providerErrors24h: providerErrors,
    revenueToday: revenueToday._sum.total,
  });
}
