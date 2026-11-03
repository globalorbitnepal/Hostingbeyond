import { NextResponse } from "next/server";

import {
  deleteCustomerDnsRecord,
  updateCustomerDnsRecord,
} from "@/lib/domains/dns-management-service";
import { parseDnsRecordBody } from "@/lib/domains/providers/namesilo-dns";
import { requireCustomerSession } from "@/lib/domains/require-customer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ registrationId: string; recordId: string }> };

async function ownedDomain(userId: string, registrationId: string) {
  const registration = await prisma.domainRegistration.findFirst({
    where: { id: registrationId, userId },
    select: { domain: true },
  });
  return registration?.domain ?? null;
}

export async function PUT(request: Request, { params }: Params) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { registrationId, recordId } = await params;
  const domain = await ownedDomain(user.id, registrationId);
  if (!domain) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseDnsRecordBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await updateCustomerDnsRecord(
    user.id,
    domain,
    decodeURIComponent(recordId),
    parsed.input,
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { registrationId, recordId } = await params;
  const domain = await ownedDomain(user.id, registrationId);
  if (!domain) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  const result = await deleteCustomerDnsRecord(
    user.id,
    domain,
    decodeURIComponent(recordId),
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true });
}
