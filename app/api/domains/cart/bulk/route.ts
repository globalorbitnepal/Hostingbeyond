import { NextResponse } from "next/server";

import { validateDomainsForBulkCart } from "@/lib/domains/bulk-cart";

export const runtime = "nodejs";

type Body = { domains?: string[] };

/** Server-side revalidation before bulk add-to-cart (never trust browser prices). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const domains = Array.isArray(body?.domains) ? body.domains : [];
  if (!domains.length) {
    return NextResponse.json(
      { error: "Select at least one domain." },
      { status: 400 },
    );
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if ("register" in o || "total" in o) {
      return NextResponse.json(
        { error: "Pricing is calculated server-side." },
        { status: 400 },
      );
    }
  }

  const result = await validateDomainsForBulkCart(domains);
  if (!result.ok) {
    return NextResponse.json(
      {
        code: result.code,
        error: result.error,
        limit: result.limit,
      },
      { status: 400 },
    );
  }
  return NextResponse.json({
    items: result.items,
    rejected: result.rejected,
    count: result.items.length,
  });
}
