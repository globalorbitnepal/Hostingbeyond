import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import {
  createCardSetupCheckout,
  detachCustomerCard,
  listCustomerCards,
} from "@/lib/payments/customer-cards";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const result = await listCustomerCards({
    userId: user.id,
    email: user.email,
  });
  return NextResponse.json(result);
}

export async function POST() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const result = await createCardSetupCheckout({
    userId: user.id,
    email: user.email,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl });
}

export async function DELETE(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    paymentMethodId?: string;
  } | null;
  const paymentMethodId = body?.paymentMethodId?.trim() ?? "";
  if (!paymentMethodId) {
    return NextResponse.json({ error: "Card is required." }, { status: 400 });
  }
  const result = await detachCustomerCard({
    userId: user.id,
    email: user.email,
    paymentMethodId,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true });
}
