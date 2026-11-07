import { NextResponse } from "next/server";

import { readOperatorFeatures } from "@/lib/beyond-master/operator-features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const features = await readOperatorFeatures();
  return NextResponse.json(
    {
      publicChat: features.publicChat,
      guestChat: features.guestChat,
      voiceInput: features.voiceInput,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
