import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeEmail } from "@/lib/customer/password";
import {
  createCustomerSession,
  customerCookieOptions,
} from "@/lib/customer/session";

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const existing = await prisma.customerUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in." },
      { status: 409 },
    );
  }

  const user = await prisma.customerUser.create({
    data: {
      email,
      name: parsed.data.name?.trim() || null,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  const { token, expiresAt } = await createCustomerSession(user.id, {
    remember: true,
    userAgent: request.headers.get("user-agent"),
  });

  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
  });
  const cookie = customerCookieOptions(expiresAt);
  response.cookies.set(cookie.name, token, cookie);
  return response;
}
