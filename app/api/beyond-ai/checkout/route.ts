import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import type { BeyondAiPlanId } from "@/config/beyond-ai-product";
import { getPlanConfig } from "@/config/beyond-ai-product";
import { createBeyondAiCheckout } from "@/lib/beyond-ai/payments";
import {
  activateFreePlan,
  activatePaidPlan,
} from "@/lib/beyond-ai/subscription";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to continue.", code: "auth_required" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    planId?: string;
    billingInterval?: "monthly" | "yearly";
  };
  const planId = (body.planId ?? "pro") as BeyondAiPlanId;
  const plan = getPlanConfig(planId);

  if (plan.priceMonthly === 0) {
    const subscription = await activateFreePlan(user.id);
    return NextResponse.json({
      ok: true,
      mode: "free_activated",
      redirectUrl: `/beyond-ai/checkout/success?plan=${planId}`,
      subscription,
    });
  }

  const checkout = await createBeyondAiCheckout(user.id, planId);
  if (!checkout.ok) {
    return NextResponse.json(
      { error: checkout.message, code: checkout.code },
      { status: checkout.code === "payment_not_configured" ? 503 : 400 },
    );
  }

  if (checkout.mode === "dev_activated") {
    const subscription = await activatePaidPlan(
      user.id,
      planId,
      body.billingInterval ?? "monthly",
    );
    return NextResponse.json({
      ok: true,
      mode: "dev_activated",
      redirectUrl: checkout.redirectUrl,
      subscription,
      warning: "Development activation only — not a real charge.",
    });
  }

  return NextResponse.json({ ok: true, redirectUrl: checkout.redirectUrl });
}
