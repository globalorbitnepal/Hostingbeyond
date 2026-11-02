import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { HOSTING_PRODUCT_REGISTRY } from "./products-registry";
import { ensureHostingProductsSeeded } from "./seed-hosting-products";

const HOSTING_PRODUCTS_TAG = "hosting-products";

export type HostingProductUpdateInput = {
  slug?: string;
  name?: string;
  category?: "WEBSITE" | "DEVELOPER" | "VPS" | "BUSINESS";
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  displayOrder?: number;
  featured?: boolean;
  badge?: string | null;
  canonicalPath?: string;
  pageTemplate?: string;
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
  freeDomainAnnualEnabled?: boolean;
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
  /**
   * Set by the editor so a partial payload never erases existing specs.
   * When omitted, absent optional spec fields are left untouched.
   */
  preserveUnsetSpecs?: boolean;
};

function revalidateHostingProducts() {
  revalidateTag(HOSTING_PRODUCTS_TAG);
  revalidateTag("orbit-content");
  revalidatePath("/", "layout");
  for (const entry of HOSTING_PRODUCT_REGISTRY) {
    revalidatePath(entry.canonicalPath);
  }
  revalidatePath("/pricing");
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
      name: input.name,
      slug: input.slug,
      category: input.category,
      status: input.status,
      displayOrder: input.displayOrder,
      featured: input.featured,
      badge: input.badge,
      canonicalPath: input.canonicalPath,
      pageTemplate: input.pageTemplate,
      shortDescription: input.shortDescription,
      heroTitle: input.heroTitle,
      heroDescription: input.heroDescription,
      heroImage: input.heroImage,
      heroCtaLabel: input.heroCtaLabel,
      heroCtaHref: input.heroCtaHref,
      secondaryCtaLabel: input.secondaryCtaLabel,
      secondaryCtaHref: input.secondaryCtaHref,
      billingMonthlyEnabled: input.billingMonthlyEnabled,
      billingYearlyEnabled: input.billingYearlyEnabled,
      freeDomainAnnualEnabled: input.freeDomainAnnualEnabled,
      ...(input.benefits !== undefined
        ? { benefits: input.benefits as Prisma.InputJsonValue }
        : {}),
      ...(input.features !== undefined
        ? { features: input.features as Prisma.InputJsonValue }
        : {}),
      ...(input.includedFeatures !== undefined
        ? { includedFeatures: input.includedFeatures as Prisma.InputJsonValue }
        : {}),
      ...(input.specifications !== undefined
        ? {
            specifications: input.specifications as Prisma.InputJsonValue,
          }
        : {}),
      ...(input.faqs !== undefined
        ? { faqs: input.faqs as Prisma.InputJsonValue }
        : {}),
      ...(input.sectionFlags !== undefined
        ? { sectionFlags: input.sectionFlags as Prisma.InputJsonValue }
        : {}),
      ...(input.seo !== undefined
        ? { seo: input.seo as Prisma.InputJsonValue }
        : {}),
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

const PLAN_KEY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class HostingPlanValidationError extends Error {
  status = 400;
}

function assertPlanInput(plan: HostingPlanUpdateInput, index: number) {
  const label = plan.planName?.trim() || `Plan ${index + 1}`;
  const planKey = plan.planKey?.trim();
  if (!planKey || !PLAN_KEY_RE.test(planKey)) {
    throw new HostingPlanValidationError(
      `${label}: plan key must be lowercase letters, numbers and hyphens.`,
    );
  }
  if (!plan.planName?.trim()) {
    throw new HostingPlanValidationError(
      `Plan ${index + 1}: name is required.`,
    );
  }
  for (const [field, value] of [
    ["monthly price", plan.monthlyPrice],
    ["yearly price", plan.yearlyPrice],
    ["setup fee", plan.setupFee],
  ] as const) {
    if (value == null) continue;
    if (!Number.isFinite(Number(value)) || Number(value) < 0) {
      throw new HostingPlanValidationError(
        `${label}: ${field} must be a valid non-negative number.`,
      );
    }
    if (Number(value) > 1_000_000) {
      throw new HostingPlanValidationError(
        `${label}: ${field} looks too high.`,
      );
    }
  }
  if (plan.sortOrder != null && !Number.isFinite(Number(plan.sortOrder))) {
    throw new HostingPlanValidationError(`${label}: display order is invalid.`);
  }
  if (plan.features && plan.features.some((f) => typeof f !== "string")) {
    throw new HostingPlanValidationError(`${label}: features must be text.`);
  }
}

/**
 * Only the keys actually present in the payload are written, so editing a price
 * can never blank out storage, RAM/CPU feature lines or backup copy.
 */
function planDataFromInput(
  plan: HostingPlanUpdateInput,
): Prisma.HostingProductPlanUncheckedUpdateInput {
  const data: Prisma.HostingProductPlanUncheckedUpdateInput = {
    planName: plan.planName.trim(),
    monthlyPrice: new Prisma.Decimal(Number(plan.monthlyPrice)),
    yearlyPrice: new Prisma.Decimal(Number(plan.yearlyPrice)),
  };
  if (plan.currency !== undefined) data.currency = plan.currency || "USD";
  if (plan.setupFee !== undefined) {
    data.setupFee = new Prisma.Decimal(Number(plan.setupFee) || 0);
  }
  if (plan.tagline !== undefined) data.tagline = plan.tagline;
  if (plan.storage !== undefined) data.storage = plan.storage;
  if (plan.bandwidth !== undefined) data.bandwidth = plan.bandwidth;
  if (plan.websites !== undefined) data.websites = plan.websites;
  if (plan.domains !== undefined) data.domains = plan.domains;
  if (plan.emailAccounts !== undefined) data.emailAccounts = plan.emailAccounts;
  if (plan.databases !== undefined) data.databases = plan.databases;
  if (plan.ssl !== undefined) data.ssl = plan.ssl;
  if (plan.backup !== undefined) data.backup = plan.backup;
  if (plan.support !== undefined) data.support = plan.support;
  if (plan.features !== undefined) {
    data.features = plan.features
      .map((f) => f.trim())
      .filter(Boolean) as Prisma.InputJsonValue;
  }
  if (plan.popular !== undefined) data.popular = plan.popular;
  if (plan.sortOrder !== undefined) data.sortOrder = Number(plan.sortOrder);
  if (plan.active !== undefined) data.active = plan.active;
  return data;
}

export async function replaceHostingProductPlans(
  productId: string,
  plans: HostingPlanUpdateInput[],
) {
  plans.forEach(assertPlanInput);

  const seen = new Set<string>();
  for (const plan of plans) {
    const key = plan.planKey.trim();
    if (seen.has(key)) {
      throw new HostingPlanValidationError(
        `Duplicate plan key "${key}" — each plan needs a unique key.`,
      );
    }
    seen.add(key);
  }

  const existing = await prisma.hostingProductPlan.findMany({
    where: { productId },
    select: { id: true, planKey: true },
  });
  const existingById = new Map(existing.map((row) => [row.id, row]));

  for (const plan of plans) {
    if (!plan.id) continue;
    const row = existingById.get(plan.id);
    if (!row) {
      throw new HostingPlanValidationError(
        "A plan in this payload does not belong to this product.",
      );
    }
    if (row.planKey !== plan.planKey.trim()) {
      throw new HostingPlanValidationError(
        `Plan keys are immutable after creation (${row.planKey}). Create a new plan instead.`,
      );
    }
  }

  const knownKeys = new Set(existing.map((row) => row.planKey));
  for (const plan of plans) {
    if (plan.id) continue;
    if (knownKeys.has(plan.planKey.trim())) {
      throw new HostingPlanValidationError(
        `Plan "${plan.planKey}" already exists on this product.`,
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const plan of plans) {
      const data = planDataFromInput(plan);
      if (plan.id) {
        await tx.hostingProductPlan.update({ where: { id: plan.id }, data });
      } else {
        await tx.hostingProductPlan.create({
          data: {
            ...(planDataFromInput(
              plan,
            ) as Prisma.HostingProductPlanUncheckedCreateInput),
            productId,
            planKey: plan.planKey.trim(),
            planName: plan.planName.trim(),
            monthlyPrice: new Prisma.Decimal(Number(plan.monthlyPrice)),
            yearlyPrice: new Prisma.Decimal(Number(plan.yearlyPrice)),
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

/** Reserved paths an admin must never reuse as a product slug. */
const RESERVED_PRODUCT_SLUGS = new Set([
  "api",
  "orbit",
  "account",
  "checkout",
  "cart",
  "login",
  "signup",
  "logout",
  "admin",
  "uploads",
  "_next",
  "sitemap",
  "robots",
]);

export function assertSafeProductSlug(slug: string) {
  const value = slug.trim().toLowerCase();
  if (!validateProductSlug(value)) {
    throw new HostingPlanValidationError(
      "Slug must be lowercase letters, numbers and single hyphens.",
    );
  }
  if (RESERVED_PRODUCT_SLUGS.has(value)) {
    throw new HostingPlanValidationError(`"${value}" is a reserved path.`);
  }
  return value;
}

export type AdminHostingPlan = {
  id: string;
  planKey: string;
  planName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  tagline: string | null;
  storage: string | null;
  bandwidth: string | null;
  websites: string | null;
  domains: string | null;
  emailAccounts: string | null;
  databases: string | null;
  ssl: string | null;
  backup: string | null;
  support: string | null;
  features: string[];
  popular: boolean;
  sortOrder: number;
  active: boolean;
  orderCount: number;
};

/**
 * Plan rows plus how many orders reference each plan key, so the admin can see
 * why a plan must be archived instead of deleted.
 */
export async function listAdminHostingPlans(
  productId: string,
): Promise<AdminHostingPlan[]> {
  const product = await prisma.hostingProduct.findUnique({
    where: { id: productId },
    include: { plans: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) return [];

  const usage = await prisma.hostingOrder.groupBy({
    by: ["planKey"],
    where: { productSlug: product.slug },
    _count: { planKey: true },
  });
  const usageByKey = new Map(
    usage.map((row) => [row.planKey, row._count.planKey]),
  );

  return product.plans.map((plan) => ({
    id: plan.id,
    planKey: plan.planKey,
    planName: plan.planName,
    monthlyPrice: Number(plan.monthlyPrice),
    yearlyPrice: Number(plan.yearlyPrice),
    currency: plan.currency,
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
    features: Array.isArray(plan.features)
      ? (plan.features as string[]).filter((f) => typeof f === "string")
      : [],
    popular: plan.popular,
    sortOrder: plan.sortOrder,
    active: plan.active,
    orderCount: usageByKey.get(plan.planKey) ?? 0,
  }));
}
