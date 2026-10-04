import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { ensureHostingProductsSeeded } from "./seed-hosting-products";

const HOSTING_PRODUCTS_TAG = "hosting-products";

export type HostingProductUpdateInput = {
  name?: string;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  displayOrder?: number;
  badge?: string | null;
  shortDescription?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string | null;
  heroCtaLabel?: string | null;
  heroCtaHref?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
  benefits?: unknown;
  features?: unknown;
  includedFeatures?: unknown;
  specifications?: unknown;
  faqs?: unknown;
  sectionFlags?: unknown;
  seo?: unknown;
  billingMonthlyEnabled?: boolean;
  billingYearlyEnabled?: boolean;
};

export type HostingPlanUpdateInput = {
  id?: string;
  planKey: string;
  planName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency?: string;
  setupFee?: number;
  tagline?: string | null;
  storage?: string | null;
  bandwidth?: string | null;
  websites?: string | null;
  domains?: string | null;
  emailAccounts?: string | null;
  databases?: string | null;
  ssl?: string | null;
  backup?: string | null;
  support?: string | null;
  features?: string[];
  popular?: boolean;
  sortOrder?: number;
  active?: boolean;
};

function revalidateHostingProducts() {
  revalidateTag(HOSTING_PRODUCTS_TAG);
}

export async function listHostingProductsForAdmin() {
  try {
    await ensureHostingProductsSeeded();
    return await prisma.hostingProduct.findMany({
      include: {
        plans: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getHostingProductBySlug(slug: string) {
  try {
    await ensureHostingProductsSeeded();
    return await prisma.hostingProduct.findUnique({
      where: { slug },
      include: {
        plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function getHostingProductById(id: string) {
  try {
    await ensureHostingProductsSeeded();
    return await prisma.hostingProduct.findUnique({
      where: { id },
      include: {
        plans: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function updateHostingProduct(
  id: string,
  input: HostingProductUpdateInput,
) {
  const row = await prisma.hostingProduct.update({
    where: { id },
    data: {
      ...input,
      benefits: input.benefits as Prisma.InputJsonValue | undefined,
      features: input.features as Prisma.InputJsonValue | undefined,
      includedFeatures: input.includedFeatures as
        Prisma.InputJsonValue | undefined,
      specifications: input.specifications as Prisma.InputJsonValue | undefined,
      faqs: input.faqs as Prisma.InputJsonValue | undefined,
      sectionFlags: input.sectionFlags as Prisma.InputJsonValue | undefined,
      seo: input.seo as Prisma.InputJsonValue | undefined,
    },
  });
  revalidateHostingProducts();
  return row;
}

export async function setHostingProductStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED",
) {
  const row = await prisma.hostingProduct.update({
    where: { id },
    data: { status },
  });
  revalidateHostingProducts();
  return row;
}

export async function replaceHostingProductPlans(
  productId: string,
  plans: HostingPlanUpdateInput[],
) {
  for (const plan of plans) {
    if (plan.monthlyPrice < 0 || plan.yearlyPrice < 0) {
      throw new Error("Prices cannot be negative");
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const plan of plans) {
      if (plan.id) {
        await tx.hostingProductPlan.update({
          where: { id: plan.id },
          data: {
            planName: plan.planName,
            monthlyPrice: plan.monthlyPrice,
            yearlyPrice: plan.yearlyPrice,
            currency: plan.currency ?? "USD",
            setupFee: plan.setupFee ?? 0,
            tagline: plan.tagline,
            storage: plan.storage,
            bandwidth: plan.bandwidth,
            websites: plan.websites,
            domains: plan.domains,
            emailAccounts: plan.emailAccounts,
            databases: plan.databases,
            ssl: plan.ssl,
            backup: plan.backup,
            support: plan.support,
            features: plan.features ?? [],
            popular: plan.popular ?? false,
            sortOrder: plan.sortOrder ?? 0,
            active: plan.active ?? true,
          },
        });
      } else {
        await tx.hostingProductPlan.create({
          data: {
            productId,
            planKey: plan.planKey,
            planName: plan.planName,
            monthlyPrice: plan.monthlyPrice,
            yearlyPrice: plan.yearlyPrice,
            currency: plan.currency ?? "USD",
            setupFee: plan.setupFee ?? 0,
            tagline: plan.tagline,
            storage: plan.storage,
            bandwidth: plan.bandwidth,
            websites: plan.websites,
            domains: plan.domains,
            emailAccounts: plan.emailAccounts,
            databases: plan.databases,
            ssl: plan.ssl,
            backup: plan.backup,
            support: plan.support,
            features: plan.features ?? [],
            popular: plan.popular ?? false,
            sortOrder: plan.sortOrder ?? 0,
            active: plan.active ?? true,
          },
        });
      }
    }
  });

  revalidateHostingProducts();
  return getHostingProductById(productId);
}

export function validateProductSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
