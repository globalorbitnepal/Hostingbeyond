import { NextResponse } from "next/server";

import { getCustomerAuthCode } from "@/lib/domains/domain-management-service";
import { requireCustomerSession } from "@/lib/domains/require-customer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ registrationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { registrationId } = await params;
  const registration = await prisma.domainRegistration.findFirst({
    where: { id: registrationId, userId: user.id },
  });
  if (!registration) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  const result = await getCustomerAuthCode(user.id, registration.domain);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true, authCode: result.authCode });
}
