import { NextResponse } from "next/server";

import {
  readIdempotencyKey,
  requireCustomerSession,
} from "@/lib/domains/require-customer";
import { createPremiumSslCheckout } from "@/lib/panel/ssl-checkout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    domain?: string;
    productId?: string;
  } | null;
  const domain = body?.domain?.trim() ?? "";
  const productId = body?.productId?.trim() ?? "";
  if (!domain || !productId) {
    return NextResponse.json(
      { error: "Domain and SSL product are required." },
      { status: 400 },
    );
  }
  const result = await createPremiumSslCheckout({
    userId: user.id,
    domain,
    productId,
    idempotencyKey: `ssl:${user.id}:${readIdempotencyKey(request)}`,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true, checkoutUrl: result.checkoutUrl });
}
