import { NextResponse } from "next/server";

import { getPublicDomainDetails } from "@/lib/domains/public-domain-details";
import {
  clientKeyFromRequest,
  rateLimitDomainSearch,
} from "@/lib/domains/rate-limit";
import { lookupErrorMessage } from "@/lib/domains/lookup";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clientKey = clientKeyFromRequest(request);
  if (!rateLimitDomainSearch(clientKey)) {
    return NextResponse.json(
      { error: lookupErrorMessage("rate_limit") },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    domain?: string;
  } | null;
  const domain = body?.domain?.trim();
  if (!domain) {
    return NextResponse.json({ error: "Domain required" }, { status: 400 });
  }

  try {
    const details = await getPublicDomainDetails(domain);
    if ("error" in details) {
      return NextResponse.json({ error: details.error }, { status: 400 });
    }
    return NextResponse.json(details);
  } catch {
    return NextResponse.json(
      { error: lookupErrorMessage("lookup_failed") },
      { status: 502 },
    );
  }
}
