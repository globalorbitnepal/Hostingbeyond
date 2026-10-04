import { NextResponse } from "next/server";

import {
  listHostingAddonsForAdmin,
  updateHostingAddon,
} from "@/lib/hosting/addons/catalog";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const addons = await listHostingAddonsForAdmin();
  return NextResponse.json({ addons });
}

export async function PUT(request: Request) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    active?: boolean;
    name?: string;
    description?: string;
    displayOrder?: number;
  } | null;

  if (!body?.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const addon = await updateHostingAddon(body.id, {
    active: body.active,
    name: body.name,
    description: body.description,
    displayOrder: body.displayOrder,
  });

  return NextResponse.json({ addon });
}
