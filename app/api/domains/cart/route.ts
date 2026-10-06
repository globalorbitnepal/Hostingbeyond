import { NextResponse } from "next/server";

import {
  addDomainToCart,
  addDomainsToCart,
  clearDomainCart,
  getDomainCartForUser,
  removeDomainFromCart,
  revalidateDomainCart,
} from "@/lib/domains/domain-cart-service";
import { requireCustomerSession } from "@/lib/domains/require-customer";

export const runtime = "nodejs";

type Body = {
  domain?: string;
  domains?: string[];
  action?: "revalidate" | "clear";
};

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const cart = await getDomainCartForUser(user.id);
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;

  if (body?.action === "revalidate") {
    const result = await revalidateDomainCart(user.id);
    const snapshot = await getDomainCartForUser(user.id);
    return NextResponse.json({ ...result, cart: snapshot });
  }

  if (body?.action === "clear") {
    await clearDomainCart(user.id);
    return NextResponse.json(await getDomainCartForUser(user.id));
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if ("register" in o || "total" in o || "price" in o) {
      return NextResponse.json(
        { error: "Pricing is calculated server-side." },
        { status: 400 },
      );
    }
  }

  const bulk = Array.isArray(body?.domains) ? body!.domains : [];
  if (bulk.length > 0) {
    const { cart, added, rejected } = await addDomainsToCart(user.id, bulk);
    return NextResponse.json({ cart, added, rejected });
  }

  const domain = body?.domain?.trim() ?? "";
  if (!domain) {
    return NextResponse.json({ error: "Domain is required." }, { status: 400 });
  }

  const result = await addDomainToCart(user.id, domain);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json(result.cart);
}

export async function DELETE(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const domain = url.searchParams.get("domain")?.trim();
  if (domain) {
    const result = await removeDomainFromCart(user.id, domain);
    return NextResponse.json(result.cart);
  }

  await clearDomainCart(user.id);
  return NextResponse.json({
    ok: true,
    ...(await getDomainCartForUser(user.id)),
  });
}
