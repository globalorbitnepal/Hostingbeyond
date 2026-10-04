import { NextRequest, NextResponse } from "next/server";

import {
  getHostingProductById,
  setHostingProductStatus,
  updateHostingProduct,
  type HostingProductUpdateInput,
} from "@/lib/hosting/hosting-products";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const product = await getHostingProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const body = (await request.json()) as {
    product?: HostingProductUpdateInput;
    status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  };

  if (body.status) {
    await setHostingProductStatus(id, body.status);
  }

  if (body.product) {
    await updateHostingProduct(id, body.product);
  }

  const product = await getHostingProductById(id);
  return NextResponse.json({ ok: true, product });
}
