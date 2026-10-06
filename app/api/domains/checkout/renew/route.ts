import { NextResponse } from "next/server";

import { processDomainRenewalCheckout } from "@/lib/domains/renewal-service";
import {
  readIdempotencyKey,
  requireCustomerSession,
} from "@/lib/domains/require-customer";

export const runtime = "nodejs";

type Body = { domain?: string; idempotencyKey?: string; periodYears?: number };

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const domain = body?.domain?.trim() ?? "";
  if (!domain) {
    return NextResponse.json({ error: "Domain is required." }, { status: 400 });
  }

  const idempotencyKey = readIdempotencyKey(request, body?.idempotencyKey);
  const result = await processDomainRenewalCheckout({
    userId: user.id,
    userEmail: user.email,
    domainInput: domain,
    idempotencyKey,
    periodYears: body?.periodYears,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    duplicate: "duplicate" in result ? result.duplicate : false,
    reconciliation: "reconciliation" in result ? result.reconciliation : false,
    order: {
      publicId: result.order.publicId,
      domain: result.order.domain,
      status: result.order.status,
      total: Number(result.order.total),
      currency: result.order.currency,
    },
  });
}
