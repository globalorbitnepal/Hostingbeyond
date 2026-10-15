import { NextResponse } from "next/server";

import { getCustomerDomainOrderByPublicId } from "@/lib/domains/customer-domain-orders";
import { requireCustomerSession } from "@/lib/domains/require-customer";

export const runtime = "nodejs";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { publicId } = await params;
  const trimmed = publicId.trim();
  if (!trimmed || trimmed.length > 64) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  try {
    const order = await getCustomerDomainOrderByPublicId(user.id, trimmed);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json(
      { error: "Could not load this order." },
      { status: 503 },
    );
  }
}
