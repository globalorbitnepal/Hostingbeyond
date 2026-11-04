import { NextResponse } from "next/server";

import { listBeyondMasterPublicModels } from "@/lib/beyond-master/model-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public model list. Never includes provider secrets. */
export async function GET() {
  const catalog = listBeyondMasterPublicModels();
  return NextResponse.json(
    {
      configured: catalog.configured,
      configurationError: catalog.configurationError,
      models: catalog.models,
      liveVerified: false,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
