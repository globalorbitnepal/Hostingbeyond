import { NextResponse } from "next/server";

import { beyondAiModelsConfig } from "@/config/beyond-ai-product";

export const runtime = "nodejs";

export async function GET() {
  const models = beyondAiModelsConfig.filter((m) => m.status === "active");
  return NextResponse.json({
    models,
    moreLabel: "+ More models",
  });
}
