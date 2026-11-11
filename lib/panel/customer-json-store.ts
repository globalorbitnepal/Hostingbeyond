import { prisma } from "@/lib/prisma";

/**
 * Per-customer JSON bags in SiteSettings, keyed so they never collide with the
 * public `default` row. Used only when a dedicated table would require a
 * production Prisma migration (gated on deploy).
 */
export function customerSslStoreId(userId: string) {
  return `customer-ssl:${userId}`;
}

export function customerStripeStoreId(userId: string) {
  return `customer-stripe:${userId}`;
}

export function customerMailStoreId(userId: string) {
  return `customer-mail:${userId}`;
}

export function customerProfileStoreId(userId: string) {
  return `customer-profile:${userId}`;
}

export async function readCustomerJsonBag<T>(
  id: string,
  fallback: T,
): Promise<T> {
  const row = await prisma.siteSettings.findUnique({
    where: { id },
    select: { data: true },
  });
  if (!row || row.data == null || typeof row.data !== "object") {
    return fallback;
  }
  return row.data as T;
}

export async function writeCustomerJsonBag(id: string, data: unknown) {
  await prisma.siteSettings.upsert({
    where: { id },
    create: { id, data: data as object },
    update: { data: data as object },
  });
}
