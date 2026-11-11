import { NextResponse } from "next/server";

import { loadOpsSnapshot } from "@/lib/orbit/ops-dashboard";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();

  try {
    const snapshot = await loadOpsSnapshot();
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      { error: "Operations dashboard could not be loaded." },
      { status: 500 },
    );
  }
}
