import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { beyondAiOnDemandConfig } from "@/config/beyond-ai-product";
import { setOnDemandEnabled } from "@/lib/beyond-ai/subscription";
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    enable?: unknown;
  } | null;
  if (typeof body?.enable !== "boolean") {
    return NextResponse.json(
      { error: "enable must be a boolean." },
      { status: 400 },
    );
  }

  const updated = await setOnDemandEnabled(user.id, body.enable);
  if (!updated) {
    return NextResponse.json(
      {
        error: "Choose a Beyond AI plan before enabling on-demand usage.",
        code: "subscription_required",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    onDemandEnabled: body.enable,
    estimateUsd: beyondAiOnDemandConfig.defaultEstimateUsd,
  });
}
