import { NextResponse } from "next/server";

import { healthPayload } from "@/lib/http/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public liveness probe. Does not touch Prisma, Stripe, or NameSilo. */
export async function GET() {
  return NextResponse.json(healthPayload(), {
    headers: { "cache-control": "no-store" },
  });
}
