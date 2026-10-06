import { NextResponse } from "next/server";

import { validateDomainForRegistration } from "@/lib/domains/validate-registration";

export const runtime = "nodejs";

type Body = { domain?: string };

/** Server-side availability + pricing before add-to-cart (never trust browser prices). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const domain = body?.domain?.trim() ?? "";
  if (!domain) {
    return NextResponse.json(
      { error: "Please enter a domain name." },
      { status: 400 },
    );
  }

  const validated = await validateDomainForRegistration(domain);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.error },
      { status: validated.status },
    );
  }

  const { result } = validated;
  if (result.status !== "available" && result.status !== "premium") {
    return NextResponse.json(
      { error: "That domain is not available to register." },
      { status: 409 },
    );
  }

  return NextResponse.json({
    domain: result.domain,
    status: result.status,
    register: result.register,
    renew: result.renew,
    transfer: result.transfer,
    currency: "USD",
  });
}
