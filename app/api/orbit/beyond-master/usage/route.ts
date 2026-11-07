import { NextResponse } from "next/server";

import { respondToBeyondMasterUsage } from "@/lib/beyond-master/usage-analytics";
import { readBeyondMasterUsageFacts } from "@/lib/beyond-master/usage-analytics-reader";
import { requireOrbitFullAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireOrbitFullAdmin();
  const result = await respondToBeyondMasterUsage({
    admin,
    params: new URL(request.url).searchParams,
    load: readBeyondMasterUsageFacts,
  });
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
