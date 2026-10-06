import { NextResponse } from "next/server";

import {
  processDomainTransferCheckout,
  refreshTransferStatus,
} from "@/lib/domains/transfer-checkout-service";
import {
  readIdempotencyKey,
  requireCustomerSession,
} from "@/lib/domains/require-customer";

export const runtime = "nodejs";

type Body = {
  domain?: string;
  authCode?: string;
  idempotencyKey?: string;
};

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const domain = body?.domain?.trim() ?? "";
  const authCode = body?.authCode?.trim() ?? "";
  if (!domain || !authCode) {
    return NextResponse.json(
      { error: "Domain and auth code are required." },
      { status: 400 },
    );
  }

  const idempotencyKey = readIdempotencyKey(request, body?.idempotencyKey);
  const result = await processDomainTransferCheckout({
    userId: user.id,
    userEmail: user.email,
    domainInput: domain,
    authCode,
    idempotencyKey,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, transfer: result.transfer ?? undefined },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    duplicate: "duplicate" in result ? result.duplicate : false,
    reconciliation: "reconciliation" in result ? result.reconciliation : false,
    transfer: {
      domain: result.transfer.domain,
      status: result.transfer.status,
      total: Number(result.transfer.total),
      currency: result.transfer.currency,
    },
  });
}

export async function GET(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const publicId = new URL(request.url).searchParams.get("publicId")?.trim();
  if (!publicId) {
    return NextResponse.json({ error: "publicId required." }, { status: 400 });
  }

  const result = await refreshTransferStatus({
    userId: user.id,
    userEmail: user.email,
    publicId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    transfer: {
      domain: result.transfer.domain,
      status: result.transfer.status,
      completedAt: result.transfer.completedAt,
    },
  });
}
