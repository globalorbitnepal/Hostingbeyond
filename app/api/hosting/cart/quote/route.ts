import { NextResponse } from "next/server";

import { parseCartBody, quoteHostingCart } from "@/lib/hosting/cart/pricing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const config = parseCartBody(body);
  if (!config?.productSlug || !config.planKey) {
    return NextResponse.json(
      { error: "Invalid cart payload." },
      { status: 400 },
    );
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (
      "subtotal" in o ||
      "total" in o ||
      "discount" in o ||
      "tax" in o ||
      "basePrice" in o ||
      "amount" in o
    ) {
      return NextResponse.json(
        { error: "Price fields are not accepted from the client." },
        { status: 400 },
      );
    }
    if (Array.isArray(o.addons)) {
      for (const item of o.addons) {
        if (item && typeof item === "object" && "price" in item) {
          return NextResponse.json(
            { error: "Add-on prices must be calculated server-side." },
            { status: 400 },
          );
        }
      }
    }
  }

  const quote = await quoteHostingCart({
    productSlug: config.productSlug,
    planKey: config.planKey,
    ...config,
  });
  if (quote.errors.length && !quote.planName) {
    return NextResponse.json(
      { quote, error: quote.errors[0] },
      { status: 400 },
    );
  }

  return NextResponse.json({ quote });
}
