import { NextResponse } from "next/server";

import { listCustomerDomains } from "@/lib/domains/registration-service";
import { requireCustomerSession } from "@/lib/domains/require-customer";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const domains = await listCustomerDomains(user.id);
    return NextResponse.json({ domains });
  } catch {
    return NextResponse.json(
      { error: "Could not load your domains." },
      { status: 503 },
    );
  }
}
