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
  const rows = await prisma.migrationRequest.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ rows });
}

export async function PUT(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    id?: string;
    status?: string;
    assignedStaff?: string;
    adminNotes?: string;
    priority?: number;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const row = await prisma.migrationRequest.update({
    where: { id: body.id },
    data: {
      status: body.status as never,
      assignedStaff: body.assignedStaff,
      adminNotes: body.adminNotes,
      priority: body.priority,
    },
  });
  await prisma.domainAuditLog.create({
    data: {
      adminUserId: admin.id,
      action: "MIGRATION_REQUEST_UPDATE",
      resource: "MigrationRequest",
      resourceId: row.id,
      details: { status: row.status },
    },
  });
  return NextResponse.json({ row });
}
