import { NextResponse } from "next/server";

import { readGeminiUsageSnapshot } from "@/lib/beyond-master/gemini-usage";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();
  try {
    const snapshot = await readGeminiUsageSnapshot();
    return NextResponse.json(snapshot, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Gemini usage could not be loaded." },
      { status: 503 },
    );
  }
}
