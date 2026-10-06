import { NextResponse } from "next/server";

import {
  checkProviderStatusForOrder,
  finalizeReconciliationOrder,
  listReconciliationOrders,
  rollbackReconciliationOrder,
} from "@/lib/domains/reconciliation-service";
import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listReconciliationOrders();
  return NextResponse.json({
    rows: rows.map((row) => ({
      id: row.id,
      domain: row.domain,
      orderType: row.orderType,
      status: row.status,
      total: Number(row.total),
      currency: row.currency,
      providerOrderId: row.providerOrderId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      customer: row.user
        ? { email: row.user.email, name: row.user.name }
        : null,
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    orderId?: string;
    action?: "check" | "finalize" | "rollback";
    snapshot?: Awaited<
      ReturnType<typeof checkProviderStatusForOrder>
    >["snapshot"];
    idempotencyKey?: string;
  };

  const orderId = body.orderId?.trim();
  const action = body.action;
  if (!orderId || !action) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (action === "check") {
    const result = await checkProviderStatusForOrder(orderId);
    await prisma.domainAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "DOMAIN_RECONCILE_CHECK",
        resource: "DomainOrder",
        resourceId: orderId,
        details: { snapshot: result.snapshot },
      },
    });
    return NextResponse.json(result);
  }

  if (!body.snapshot) {
    return NextResponse.json(
      { error: "Run provider check first." },
      { status: 400 },
    );
  }

  try {
    if (action === "finalize") {
      const order = await finalizeReconciliationOrder({
        adminUserId: admin.id,
        orderId,
        snapshot: body.snapshot,
      });
      return NextResponse.json({ ok: true, order });
    }
    if (action === "rollback") {
      const order = await rollbackReconciliationOrder({
        adminUserId: admin.id,
        orderId,
        snapshot: body.snapshot,
        idempotencyKey:
          body.idempotencyKey?.trim() || `reconcile-rollback:${orderId}`,
      });
      return NextResponse.json({ ok: true, order });
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : "reconcile_failed";
    return NextResponse.json({ error: code }, { status: 400 });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
