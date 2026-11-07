import { NextResponse } from "next/server";

import { requireOrbitFullAdmin } from "@/lib/orbit/api";
import { orbitAdminResetCustomerPassword } from "@/lib/orbit/customer-directory";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await context.params;
  let body: { newPassword?: string };
  try {
    body = (await request.json()) as { newPassword?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const newPassword = body.newPassword?.trim() ?? "";
  if (!newPassword) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  try {
    await orbitAdminResetCustomerPassword({
      adminUserId: admin.id,
      userId,
      newPassword,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "reset_failed";
    if (message === "password_too_short") {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
