import { NextResponse } from "next/server";

import { listHostingProductsForAdmin } from "@/lib/hosting/hosting-products";
import { startingPriceLabel } from "@/lib/hosting/plans-to-cms";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { ensureHomeSeeded } from "@/lib/orbit/content";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  await ensureHomeSeeded();
  const products = await listHostingProductsForAdmin();
  const rows = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    status: product.status,
    canonicalPath: product.canonicalPath,
    displayOrder: product.displayOrder,
    updatedAt: product.updatedAt,
    planCount: product.plans.filter((p) => p.active).length,
    startingPrice: startingPriceLabel(product.plans),
  }));

  return NextResponse.json({ products: rows });
}
