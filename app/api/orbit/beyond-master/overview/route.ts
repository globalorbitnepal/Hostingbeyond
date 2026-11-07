import { NextResponse } from "next/server";

import { respondToBeyondMasterOverview } from "@/lib/beyond-master/overview";
import { readBeyondMasterOverviewFacts } from "@/lib/beyond-master/overview-reader";
import { beyondMasterOverviewFactsOverride } from "@/lib/beyond-master/overview-test-hook";
import { requireOrbitFullAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireOrbitFullAdmin();
  const result = await respondToBeyondMasterOverview({
    admin,
    loadFacts:
      beyondMasterOverviewFactsOverride() ?? readBeyondMasterOverviewFacts,
    env: process.env,
  });
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
