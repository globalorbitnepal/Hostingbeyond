import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function serializeOrder(order: {
  id: string;
  status: string;
  productSlug: string;
  planKey: string;
  billingCycle: string;
  currency: string;
  subtotal: unknown;
  discount: unknown;
  tax: unknown;
  total: unknown;
  lineItemsSnapshot: unknown;
  configuration: unknown;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}) {
  const num = (v: unknown) =>
    v == null
      ? null
      : typeof v === "object" && v !== null && "toNumber" in v
        ? (v as { toNumber: () => number }).toNumber()
        : Number(v);
  return {
    id: order.id,
    status: order.status,
    productSlug: order.productSlug,
    planKey: order.planKey,
    billingCycle: order.billingCycle,
    currency: order.currency,
    subtotal: num(order.subtotal),
    discount: num(order.discount),
    tax: num(order.tax),
    total: num(order.total),
    lineItemsSnapshot: order.lineItemsSnapshot,
    configuration: order.configuration,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    expiresAt: order.expiresAt?.toISOString() ?? null,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { orderId } = await context.params;
  if (!orderId || orderId.length > 64) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  const order = await prisma.hostingOrder.findFirst({
    where: { id: orderId, userId: user.id },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order: serializeOrder(order) });
}
