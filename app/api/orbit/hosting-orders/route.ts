import { NextResponse } from "next/server";
import type { HostingOrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireOrbitFullAdmin } from "@/lib/orbit/api";
import { readHostingSites } from "@/lib/hosting/customer-hosting-sites";
import { canTransitionHostingOrderStatus } from "@/lib/hosting/provisioning";

export const runtime = "nodejs";

const STATUSES: HostingOrderStatus[] = [
  "DRAFT",
  "PENDING_PAYMENT",
  "PAID",
  "PROVISIONING",
  "ACTIVE",
  "CANCELLED",
  "FAILED",
  "EXPIRED",
];

export async function GET(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status")?.trim().toUpperCase();
  const status =
    statusParam && (STATUSES as string[]).includes(statusParam)
      ? (statusParam as HostingOrderStatus)
      : null;
  const query = url.searchParams.get("q")?.trim() ?? "";

  const rows = await prisma.hostingOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query
        ? {
            user: {
              OR: [
                { email: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  return NextResponse.json({
    rows: rows.map((row) => {
      const snapshot = (row.lineItemsSnapshot ?? {}) as {
        planName?: string;
        productName?: string;
      };
      const sites = readHostingSites(row.configuration);
      return {
        id: row.id,
        status: row.status,
        productSlug: row.productSlug,
        planKey: row.planKey,
        planName:
          snapshot.planName?.trim() || `${row.productSlug} · ${row.planKey}`,
        productName: snapshot.productName?.trim() || row.productSlug,
        billingCycle: row.billingCycle,
        total: Number(row.total),
        currency: row.currency,
        paymentStatus: row.paymentStatus,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        user: row.user,
        sites: sites.map((site) => ({
          id: site.id,
          type: site.type,
          name: site.name,
          domain: site.domain,
          status: site.status,
          createdAt: site.createdAt,
        })),
      };
    }),
  });
}

/** Staff-driven status move (e.g. mark paid order Active after manual setup). */
export async function PATCH(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const payload = (body ?? {}) as Record<string, unknown>;
  const orderId =
    typeof payload.orderId === "string" ? payload.orderId.trim() : "";
  const nextStatus =
    typeof payload.status === "string"
      ? (payload.status.trim().toUpperCase() as HostingOrderStatus)
      : null;
  const note = typeof payload.note === "string" ? payload.note.trim() : "";

  if (!orderId || !nextStatus || !(STATUSES as string[]).includes(nextStatus)) {
    return NextResponse.json(
      { error: "orderId and a valid status are required." },
      { status: 400 },
    );
  }

  const order = await prisma.hostingOrder.findUnique({
    where: { id: orderId },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (!canTransitionHostingOrderStatus(order.status, nextStatus)) {
    return NextResponse.json(
      {
        error: `Cannot move an order from ${order.status} to ${nextStatus}.`,
      },
      { status: 409 },
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.hostingOrder.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });
    await tx.activityLog.create({
      data: {
        adminUserId: admin.id,
        action: "SETTINGS_UPDATE",
        resource: `HostingOrder:${orderId}`,
        details: JSON.stringify({
          kind: "orbit_hosting_status_change",
          from: order.status,
          to: nextStatus,
          note,
        }),
      },
    });
    return row;
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
