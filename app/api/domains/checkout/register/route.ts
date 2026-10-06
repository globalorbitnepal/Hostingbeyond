import { NextResponse } from "next/server";

import { processDomainRegistrationCheckout } from "@/lib/domains/registration-service";
import {
  readIdempotencyKey,
  requireCustomerSession,
} from "@/lib/domains/require-customer";
import { customerMessageForOrderStatus } from "@/lib/domains/notifications";

export const runtime = "nodejs";

type Body = { domain?: string; idempotencyKey?: string };

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const domain = body?.domain?.trim() ?? "";
  if (!domain) {
    return NextResponse.json(
      { error: "Please enter a domain name." },
      { status: 400 },
    );
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if ("register" in o || "total" in o || "price" in o) {
      return NextResponse.json(
        { error: "Pricing is calculated server-side." },
        { status: 400 },
      );
    }
  }

  const idempotencyKey = readIdempotencyKey(request, body?.idempotencyKey);

  try {
    const result = await processDomainRegistrationCheckout({
      userId: user.id,
      userEmail: user.email,
      domainInput: domain,
      idempotencyKey,
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
      reconciliation:
        "reconciliation" in result ? result.reconciliation : false,
      order: {
        domain: result.order.domain,
        status: result.order.status,
        total: Number(result.order.total),
        currency: result.order.currency,
        message: customerMessageForOrderStatus(result.order.status),
        customerStatus:
          result.order.status === "REGISTERED" ? "Active" : undefined,
      },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "checkout_failed";
    if (code === "lookup_unconfigured") {
      return NextResponse.json(
        { error: "Domain registration is temporarily unavailable." },
        { status: 503 },
      );
    }
    if (code === "insufficient_funds") {
      return NextResponse.json(
        { error: "Insufficient wallet balance. Add funds and try again." },
        { status: 402 },
      );
    }
    if (code === "domain_unavailable") {
      return NextResponse.json(
        { error: "That domain is no longer available." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Registration could not be completed." },
      { status: 502 },
    );
  }
}
