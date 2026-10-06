import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin } from "@/lib/orbit/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = new URL(request.url).searchParams.get("status");
  const rows = await prisma.domainOrder.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true, name: true } } },
  });
  return NextResponse.json({ rows });
}
