import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = new URL(request.url).searchParams.get("status");
  const rows = await prisma.domainOrder.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      publicId: true,
      domain: true,
      tld: true,
      orderType: true,
      status: true,
      provider: true,
      retailPrice: true,
      supplierCost: true,
      tax: true,
      discount: true,
      total: true,
      currency: true,
      errorCode: true,
      errorMessageCustomer: true,
      createdAt: true,
      completedAt: true,
      user: { select: { email: true, name: true } },
    },
  });
  return NextResponse.json({
    rows: rows.map((row) => ({
      publicId: row.publicId,
      domain: row.domain,
      tld: row.tld,
      orderType: row.orderType,
      status: row.status,
      provider: row.provider,
      retailPrice: Number(row.retailPrice),
      supplierCost: row.supplierCost == null ? null : Number(row.supplierCost),
      tax: row.tax == null ? null : Number(row.tax),
      discount: Number(row.discount),
      total: Number(row.total),
      currency: row.currency,
      errorCode: row.errorCode,
      errorMessageCustomer: row.errorMessageCustomer,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
      user: row.user,
    })),
  });
}
