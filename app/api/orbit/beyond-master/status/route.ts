import { NextResponse } from "next/server";

import { beyondMasterOrbitModelStatus } from "@/lib/beyond-master/model-registry";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only provider status for a future Orbit screen. Never returns the API key. */
export async function GET() {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  return NextResponse.json(beyondMasterOrbitModelStatus(), {
    headers: { "cache-control": "no-store" },
  });
}
