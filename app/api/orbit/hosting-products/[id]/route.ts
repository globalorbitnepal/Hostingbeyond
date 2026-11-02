import { NextRequest, NextResponse } from "next/server";

import { orbitAdminMutationError } from "@/lib/http/safe-api-error";
import {
  assertSafeProductSlug,
  getHostingProductById,
  listAdminHostingPlans,
  replaceHostingProductPlans,
  setHostingProductStatus,
  updateHostingProduct,
  type HostingPlanUpdateInput,
  type HostingProductUpdateInput,
} from "@/lib/hosting/hosting-products";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { logActivity } from "@/lib/orbit/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const [product, plans] = await Promise.all([
    getHostingProductById(id),
    listAdminHostingPlans(id),
  ]);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product, plans });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    product?: HostingProductUpdateInput & { slug?: string };
    status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    if (body.product?.slug !== undefined) {
      const slug = assertSafeProductSlug(body.product.slug);
      const clash = await prisma.hostingProduct.findFirst({
        where: { slug, NOT: { id } },
        select: { id: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: `Slug "${slug}" is already used by another product.` },
          { status: 409 },
        );
      }
      body.product = { ...body.product, slug };
    }

    if (body.status) {
      await setHostingProductStatus(id, body.status);
      await logActivity({
        adminUserId: admin.id,
        action: "CONTENT_UPDATE",
        resource: `hosting-product:${id}`,
        details: `Set product status to ${body.status}`,
      });
    }

    if (body.product) {
      await updateHostingProduct(id, body.product);
      await logActivity({
        adminUserId: admin.id,
        action: "CONTENT_UPDATE",
        resource: `hosting-product:${id}`,
        details: `Updated hosting product content${
          body.product.slug ? ` (slug ${body.product.slug})` : ""
        }`,
      });
    }

    const [product, plans] = await Promise.all([
      getHostingProductById(id),
      listAdminHostingPlans(id),
    ]);
    return NextResponse.json({ ok: true, product, plans });
  } catch (error) {
    const { error: message, status } = orbitAdminMutationError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await requireOrbitAdmin();
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
      details: `Updated ${body.plans.length} hosting plan(s)`,
    });
    return NextResponse.json({
      ok: true,
      product,
      plans: await listAdminHostingPlans(id),
    });
  } catch (error) {
    const { error: message, status } = orbitAdminMutationError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
