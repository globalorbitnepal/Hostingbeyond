import { NextResponse } from "next/server";

import { lookupPublicWhois } from "@/lib/domains/public-whois";
import {
  clientKeyFromRequest,
  rateLimitDomainSearch,
} from "@/lib/domains/rate-limit";
import { lookupErrorMessage } from "@/lib/domains/lookup";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clientKey = clientKeyFromRequest(request);
  if (!rateLimitDomainSearch(`whois:${clientKey}`)) {
    return NextResponse.json(
      { error: lookupErrorMessage("rate_limit") },
      { status: 429 },
    );
  }

  const domain = new URL(request.url).searchParams.get("domain")?.trim();
  if (!domain) {
    return NextResponse.json({ error: "Domain required" }, { status: 400 });
  }

  const result = await lookupPublicWhois(domain);
  if ("error" in result) {
    const status = /valid domain|enter a domain/i.test(result.error)
      ? 400
      : /not found/i.test(result.error)
        ? 404
        : 502;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json(result);
}
