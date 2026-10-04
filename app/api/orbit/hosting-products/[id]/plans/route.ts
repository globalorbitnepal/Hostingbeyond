import { NextRequest, NextResponse } from "next/server";

import {
  getHostingProductById,
  replaceHostingProductPlans,
  type HostingPlanUpdateInput,
} from "@/lib/hosting/hosting-products";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const body = (await request.json()) as { plans?: HostingPlanUpdateInput[] };
  if (!body.plans?.length) {
    return NextResponse.json({ error: "Missing plans" }, { status: 400 });
  }

  try {
    const product = await replaceHostingProductPlans(id, body.plans);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Save failed",
      },
      { status: 400 },
    );
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const product = await getHostingProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ plans: product.plans });
}
