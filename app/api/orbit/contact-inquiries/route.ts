import { NextResponse } from "next/server";

import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export type ContactInquiryRow = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  topic: string;
  company: string | null;
  message: string;
};

function readInquiries(sections: unknown): ContactInquiryRow[] {
  if (!sections || typeof sections !== "object") return [];
  const raw = (sections as { inquiries?: unknown }).inquiries;
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is ContactInquiryRow => {
    if (!row || typeof row !== "object") return false;
    const entry = row as Partial<ContactInquiryRow>;
    return Boolean(entry.id && entry.email && entry.message);
  });
}

/** Contact form submissions captured by POST /api/contact. */
export async function GET() {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();

  const row = await prisma.pageContent.findUnique({
    where: { slug: "contact-inquiries" },
    select: { sections: true },
  });

  const inquiries = readInquiries(row?.sections).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return NextResponse.json({ inquiries, total: inquiries.length });
}

/** Deletes a single inquiry by id. */
export async function DELETE(request: Request) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json().catch(() => null)) as {
    id?: string;
  } | null;
  const id = body?.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const row = await prisma.pageContent.findUnique({
    where: { slug: "contact-inquiries" },
    select: { sections: true },
  });
  if (!row) {
    return NextResponse.json(
      { error: "No inquiries stored." },
      { status: 404 },
    );
  }

  const remaining = readInquiries(row.sections).filter(
    (entry) => entry.id !== id,
  );

  await prisma.pageContent.update({
    where: { slug: "contact-inquiries" },
    data: { sections: { inquiries: remaining } },
  });

  return NextResponse.json({ ok: true, total: remaining.length });
}
