import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { normalizeEmail, verifyPassword } from "@/lib/customer/password";
import {
  createCustomerSession,
  customerCookieOptions,
} from "@/lib/customer/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
  remember: z.boolean().optional(),
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
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.customerUser.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const { token, expiresAt } = await createCustomerSession(user.id, {
    remember: parsed.data.remember !== false,
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
