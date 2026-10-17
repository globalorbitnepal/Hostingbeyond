import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { publicId } from "@/lib/domains/transfer-service";
import { sendMigrationRequestReceived } from "@/lib/domains/email-hooks";
import { rateLimitResponse } from "@/lib/http/fixed-window-rate-limit";
import { rateLimitMigrationRequest } from "@/lib/http/public-endpoint-rate-limit";
import {
  migrationRequestBodySchema,
  normalizeMigrationRequestBody,
  resolveMigrationCustomerEmail,
} from "@/lib/migration/migration-request-input";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!rateLimitMigrationRequest(request)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = migrationRequestBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const sessionUser = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );

  const normalized = normalizeMigrationRequestBody(parsed.data);
  const customerEmail = resolveMigrationCustomerEmail(
    sessionUser?.email ?? null,
    normalized.customerEmail,
  );

  let record;
  try {
    record = await prisma.migrationRequest.create({
      data: {
        publicId: publicId("MIG"),
        userId: sessionUser?.id ?? null,
        customerName: normalized.customerName,
        customerEmail,
        customerPhone: normalized.customerPhone,
        websiteUrl: normalized.websiteUrl,
        currentProvider: normalized.currentProvider,
        domain: normalized.domain,
        websiteType: normalized.websiteType,
        emailAccountsCount: normalized.emailAccountsCount,
        websiteSize: normalized.websiteSize,
        databaseRequired: normalized.databaseRequired,
        preferredDate: normalized.preferredDate,
        notes: normalized.notes,
        status: "NEW",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save your request. Please try again later." },
      { status: 500 },
    );
  }

  try {
    await sendMigrationRequestReceived({
      email: record.customerEmail,
      publicId: record.publicId,
      domain: record.domain,
    });
  } catch {
    console.error(
      JSON.stringify({
        scope: "migration.request",
        event: "notification_failed",
        publicId: record.publicId,
      }),
    );
  }

  return NextResponse.json({
    ok: true,
    requestId: record.publicId,
    message:
      "Your migration request was received. Our team will contact you shortly.",
  });
}
