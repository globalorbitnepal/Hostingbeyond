import { NextResponse } from "next/server";
import { z } from "zod";

import type { Prisma } from "@prisma/client";

import { CONTACT_TOPICS } from "@/lib/orbit/contact-page-content";
import { prisma } from "@/lib/prisma";

type ContactInquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  topic: string;
  company: string | null;
  message: string;
};

export const runtime = "nodejs";

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  topic: z.string().min(1).max(80),
  message: z.string().min(10).max(8000),
  company: z.string().max(120).optional(),
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

  const topicOk = CONTACT_TOPICS.includes(
    parsed.data.topic as (typeof CONTACT_TOPICS)[number],
  );
  if (!topicOk) {
    return NextResponse.json({ error: "Invalid topic." }, { status: 400 });
  }

  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    topic: parsed.data.topic,
    company: parsed.data.company?.trim() || null,
    message: parsed.data.message.trim(),
  };

  const existing = await prisma.pageContent.findUnique({
    where: { slug: "contact-inquiries" },
  });
  const sections = (existing?.sections as {
    inquiries?: ContactInquiry[];
  } | null) ?? {
    inquiries: [],
  };
  const inquiries: ContactInquiry[] = Array.isArray(sections.inquiries)
    ? sections.inquiries
    : [];
  inquiries.unshift(entry);
  const trimmed = inquiries.slice(0, 500);
  const sectionsJson: Prisma.InputJsonValue = { inquiries: trimmed };

  await prisma.pageContent.upsert({
    where: { slug: "contact-inquiries" },
    create: {
      slug: "contact-inquiries",
      title: "Contact form inquiries",
      isPublished: false,
      isVisible: false,
      sections: sectionsJson,
    },
    update: { sections: sectionsJson },
  });

  return NextResponse.json({ ok: true });
}
