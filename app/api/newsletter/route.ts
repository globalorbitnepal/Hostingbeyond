import { NextResponse } from "next/server";

import { rateLimitResponse } from "@/lib/http/fixed-window-rate-limit";
import { rateLimitNewsletter } from "@/lib/http/public-endpoint-rate-limit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!rateLimitNewsletter(request)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const existing = await prisma.pageContent.findUnique({
    where: { slug: "newsletter-subscribers" },
  });
  const sections = (existing?.sections as {
    subscribers?: string[];
  } | null) ?? {
    subscribers: [],
  };
  const subscribers = Array.isArray(sections.subscribers)
    ? sections.subscribers
    : [];
  if (!subscribers.includes(email)) subscribers.push(email);

  await prisma.pageContent.upsert({
    where: { slug: "newsletter-subscribers" },
    create: {
      slug: "newsletter-subscribers",
      title: "Newsletter subscribers",
      isPublished: false,
      isVisible: false,
      sections: { subscribers },
    },
    update: { sections: { subscribers } },
  });

  return NextResponse.json({ ok: true });
}
