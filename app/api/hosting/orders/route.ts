import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { parseCartBody, quoteHostingCart } from "@/lib/hosting/cart/pricing";
import { upsertHostingDraftOrder } from "@/lib/hosting/hosting-orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const config = parseCartBody(body);
  if (!config?.productSlug || !config.planKey) {
    return NextResponse.json(
      { error: "Invalid cart payload." },
      { status: 400 },
    );
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if ("total" in o || "subtotal" in o) {
      return NextResponse.json(
        { error: "Totals must be calculated server-side." },
        { status: 400 },
      );
    }
  }

  const quote = await quoteHostingCart({
    productSlug: config.productSlug,
    planKey: config.planKey,
    ...config,
  });
  if (quote.errors.length) {
    return NextResponse.json(
      { error: quote.errors.join(" "), quote },
      { status: 400 },
    );
  }

  const status =
    typeof body === "object" &&
    body &&
    (body as { status?: string }).status === "PENDING_PAYMENT"
      ? "PENDING_PAYMENT"
      : "DRAFT";

  const order = await upsertHostingDraftOrder({
    userId: user.id,
    quote,
    status,
  });

  return NextResponse.json({ orderId: order.id, quote });
}
