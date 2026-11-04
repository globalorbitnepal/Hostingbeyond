import { NextResponse } from "next/server";

import { beyondMasterAdminStatus } from "@/lib/beyond-master/settings";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only provider status for a future Orbit screen. Never returns the API key. */
export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();
  return NextResponse.json(beyondMasterAdminStatus(), {
    headers: { "cache-control": "no-store" },
  });
}
