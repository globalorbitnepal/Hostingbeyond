import { NextResponse } from "next/server";

import { beyondAiPlansConfig } from "@/config/beyond-ai-product";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ plans: beyondAiPlansConfig });
}
