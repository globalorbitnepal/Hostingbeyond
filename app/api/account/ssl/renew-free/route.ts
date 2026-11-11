import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { queueFreeSslRenewal } from "@/lib/panel/ssl-inventory";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    domain?: string;
  } | null;
  const domain = body?.domain?.trim().toLowerCase() ?? "";
  if (!domain) {
    return NextResponse.json({ error: "Domain is required." }, { status: 400 });
  }
  const result = await queueFreeSslRenewal({ userId: user.id, domain });
  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : 409;
    const message =
      result.reason === "not_found"
        ? "That domain is not on this account."
        : "Free AutoSSL renews only on an active hosting plan.";
    return NextResponse.json({ error: message }, { status });
  }
  return NextResponse.json({ ok: true, expiresAt: result.expiresAt });
}
