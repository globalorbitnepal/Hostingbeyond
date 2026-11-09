import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { addHostingSite } from "@/lib/hosting/customer-hosting-plans";
import {
  HOSTING_SITE_TYPES,
  validateSiteDomain,
  validateSiteName,
} from "@/lib/hosting/customer-hosting-sites";

export const runtime = "nodejs";

const MESSAGES: Record<string, { error: string; status: number }> = {
  order_not_found: { error: "That hosting order was not found.", status: 404 },
  plan_not_active: {
    error:
      "Sites can only be added once the hosting plan is Active. Complete payment first.",
    status: 409,
  },
  site_limit_reached: {
    error:
      "This plan has reached its website limit. Upgrade to add another site.",
    status: 409,
  },
  invalid_input: { error: "Check the site name and domain.", status: 400 },
};

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
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
  const type = typeof payload.type === "string" ? payload.type.trim() : "";
  const name = validateSiteName(payload.name);
  const rawDomain =
    typeof payload.domain === "string" ? payload.domain.trim() : "";
  const domain = rawDomain ? validateSiteDomain(rawDomain) : null;

  if (
    !orderId ||
    !(HOSTING_SITE_TYPES as readonly string[]).includes(type) ||
    !name ||
    (rawDomain && !domain)
  ) {
    return NextResponse.json(
      { error: MESSAGES.invalid_input.error },
      { status: 400 },
    );
  }

  const result = await addHostingSite({
    userId: user.id,
    orderId,
    type,
    name,
    domain,
  });

  if (!result.ok) {
    const mapped = MESSAGES[result.reason] ?? {
      error: "Could not create the website.",
      status: 500,
    };
    return NextResponse.json(
      { error: mapped.error },
      { status: mapped.status },
    );
  }

  return NextResponse.json({ ok: true, siteId: result.siteId });
}
