import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword, verifyPassword } from "@/lib/customer/password";
import { requireCustomerSession } from "@/lib/domains/require-customer";
import { rateLimitResponse } from "@/lib/http/fixed-window-rate-limit";
import { rateLimitAuthEndpoint } from "@/lib/http/public-endpoint-rate-limit";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    currentPassword: z.string().max(200).optional(),
    newPassword: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  if (!rateLimitAuthEndpoint(request)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a new password of at least 8 characters." },
      { status: 400 },
    );
  }

  const sessionUser = await requireCustomerSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.customerUser.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (user.passwordHash) {
    const current = parsed.data.currentPassword?.trim() ?? "";
    if (!current) {
      return NextResponse.json(
        { error: "Enter your current password." },
        { status: 400 },
      );
    }
    const valid = await verifyPassword(current, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.customerUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
