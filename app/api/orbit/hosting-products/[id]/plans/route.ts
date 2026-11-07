import { NextRequest, NextResponse } from "next/server";

import {
  getHostingProductById,
  replaceHostingProductPlans,
  type HostingPlanUpdateInput,
} from "@/lib/hosting/hosting-products";
import { orbitAdminMutationError } from "@/lib/http/safe-api-error";
import { requireOrbitFullAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { logActivity } from "@/lib/orbit/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    plans?: HostingPlanUpdateInput[];
  } | null;
  if (!body?.plans?.length) {
    return NextResponse.json({ error: "Missing plans" }, { status: 400 });
  }

  try {
    const product = await replaceHostingProductPlans(id, body.plans);
    await logActivity({
      adminUserId: admin.id,
      action: "CONTENT_UPDATE",
      resource: `hosting-product:${product?.slug ?? id}`,
      details: `Updated ${body.plans.length} hosting plan(s): ${body.plans
        .map((p) => `${p.planKey} $${p.monthlyPrice}/mo`)
        .join(", ")}`,
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const { error: message, status } = orbitAdminMutationError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitFullAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const product = await getHostingProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ plans: product.plans });
}
