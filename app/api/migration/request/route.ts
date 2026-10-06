import { NextResponse } from "next/server";
import { z } from "zod";

import { publicId } from "@/lib/domains/transfer-service";
import { sendMigrationRequestReceived } from "@/lib/domains/email-hooks";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email().max(200),
  customerPhone: z.string().max(40).optional(),
  websiteUrl: z.string().max(500).optional(),
  currentProvider: z.string().max(120).optional(),
  domain: z.string().max(253).optional(),
  websiteType: z.string().max(80).optional(),
  emailAccountsCount: z.coerce.number().int().min(0).max(999).optional(),
  websiteSize: z.string().max(80).optional(),
  databaseRequired: z.boolean().optional(),
  preferredDate: z.string().optional(),
  notes: z.string().max(4000).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const preferredDate = data.preferredDate
    ? new Date(data.preferredDate)
    : null;

  const record = await prisma.migrationRequest.create({
    data: {
      publicId: publicId("MIG"),
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone?.trim(),
      websiteUrl:
        data.websiteUrl?.trim() && data.websiteUrl.includes(".")
          ? data.websiteUrl.trim()
          : null,
      currentProvider: data.currentProvider?.trim(),
      domain: data.domain?.trim().toLowerCase(),
      websiteType: data.websiteType?.trim(),
      emailAccountsCount: data.emailAccountsCount,
      websiteSize: data.websiteSize?.trim(),
      databaseRequired: data.databaseRequired ?? false,
      preferredDate:
        preferredDate && !Number.isNaN(preferredDate.getTime())
          ? preferredDate
          : null,
      notes: data.notes?.trim(),
      status: "NEW",
    },
  });

  await sendMigrationRequestReceived({
    email: record.customerEmail,
    publicId: record.publicId,
    domain: record.domain,
  });

  return NextResponse.json({
    ok: true,
    requestId: record.publicId,
    message:
      "Your migration request was received. Our team will contact you shortly.",
  });
}
