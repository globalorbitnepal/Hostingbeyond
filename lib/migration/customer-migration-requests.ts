import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Requests owned by userId or legacy anonymous rows matching the customer's email only. */
export function migrationRequestsWhereForCustomer(
  userId: string,
  email: string,
): Prisma.MigrationRequestWhereInput {
  const customerEmail = email.trim().toLowerCase();
  return {
    OR: [{ userId }, { userId: null, customerEmail }],
  };
}

export async function countCustomerMigrationRequests(
  userId: string,
  email: string,
): Promise<number> {
  return prisma.migrationRequest.count({
    where: migrationRequestsWhereForCustomer(userId, email),
  });
}
