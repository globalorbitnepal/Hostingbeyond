import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  INTERNATIONAL_LAUNCH_CATALOG,
  INTERNATIONAL_LAUNCH_PRODUCT_SLUGS,
  type InternationalLaunchPlan,
} from "./international-launch-catalog";

function planRow(
  productId: string,
  plan: InternationalLaunchPlan,
  sortOrder: number,
): Prisma.HostingProductPlanUncheckedCreateInput {
  return {
    productId,
    planKey: plan.planKey,
    planName: plan.planName,
    monthlyPrice: new Prisma.Decimal(plan.monthlyPrice),
    yearlyPrice: new Prisma.Decimal(plan.yearlyPrice),
    currency: "USD",
    tagline: plan.tagline,
    storage: plan.storage,
    websites: plan.websites,
    databases: plan.databases,
    ssl: plan.ssl,
    backup: plan.backup,
    features: plan.features as Prisma.InputJsonValue,
    popular: Boolean(plan.popular),
    sortOrder,
    active: true,
  };
}

/**
 * Upsert launch catalog plans and retire legacy keys (essential, plus, etc.).
 * Runs on every app boot path that already calls ensureHostingProductsSeeded.
 */
export async function syncInternationalLaunchPlans() {
  try {
    await prisma.hostingProduct.findFirst();
  } catch {
    return;
  }

  for (const entry of INTERNATIONAL_LAUNCH_CATALOG) {
    const product = await prisma.hostingProduct.findUnique({
      where: { slug: entry.slug },
      include: { plans: true },
    });
    if (!product) continue;

    const catalogKeys = new Set(entry.plans.map((p) => p.planKey));

    for (const [index, plan] of entry.plans.entries()) {
      const existing = product.plans.find((p) => p.planKey === plan.planKey);
      const data = planRow(product.id, plan, index);
      if (existing) {
        await prisma.hostingProductPlan.update({
          where: { id: existing.id },
          data: {
            planName: data.planName,
            monthlyPrice: data.monthlyPrice,
            yearlyPrice: data.yearlyPrice,
            tagline: data.tagline,
            storage: data.storage,
            websites: data.websites,
            databases: data.databases,
            ssl: data.ssl,
            backup: data.backup,
            features: data.features,
            popular: data.popular,
            sortOrder: data.sortOrder,
            active: true,
          },
        });
      } else {
        await prisma.hostingProductPlan.create({ data });
      }
    }

    for (const row of product.plans) {
      if (!catalogKeys.has(row.planKey)) {
        await prisma.hostingProductPlan.update({
          where: { id: row.id },
          data: { active: false },
        });
      }
    }
  }

  await prisma.hostingProduct.updateMany({
    where: {
      slug: {
        notIn: [...INTERNATIONAL_LAUNCH_PRODUCT_SLUGS],
      },
      category: { in: ["WEBSITE", "DEVELOPER"] },
    },
    data: { status: "INACTIVE" },
  });

  await prisma.hostingProduct.updateMany({
    where: { slug: { in: [...INTERNATIONAL_LAUNCH_PRODUCT_SLUGS] } },
    data: { status: "ACTIVE", freeDomainAnnualEnabled: true },
  });
}
