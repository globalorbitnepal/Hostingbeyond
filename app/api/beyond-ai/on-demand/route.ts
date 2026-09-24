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

  const body = (await request.json()) as { enable?: boolean };
  await setOnDemandEnabled(user.id, Boolean(body.enable));

  return NextResponse.json({
    ok: true,
    onDemandEnabled: Boolean(body.enable),
    estimateUsd: beyondAiOnDemandConfig.defaultEstimateUsd,
  });
}
