import { Prisma } from "@prisma/client";

import { TRANSFER_IN_PROGRESS_STATUSES } from "@/lib/domains/transfer-security";
import { prisma } from "@/lib/prisma";

/** PostgreSQL partial unique index — see migration `transfer_inflight_unique`. */
export const TRANSFER_INFLIGHT_UNIQUE_INDEX =
  "DomainTransferRecord_user_domain_inflight_key";

export function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function findInFlightTransferForUserDomain(
  userId: string,
  domainQuery: string,
) {
  return prisma.domainTransferRecord.findFirst({
    where: {
      userId,
      status: { in: [...TRANSFER_IN_PROGRESS_STATUSES] },
      domain: { equals: domainQuery, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type CreateInFlightTransferInput = {
  publicId: string;
  userId: string;
  domain: string;
  tld: string;
  retailPrice: number;
  total: number;
  currency: string;
  authCodeHint: string;
};

export async function createInFlightTransferRecord(
  input: CreateInFlightTransferInput,
) {
  const domain = input.domain.toLowerCase();
  try {
    const record = await prisma.domainTransferRecord.create({
      data: {
        publicId: input.publicId,
        userId: input.userId,
        domain,
        tld: input.tld,
        status: "PENDING_PAYMENT",
        retailPrice: input.retailPrice,
        total: input.total,
        currency: input.currency,
        authCodeHint: input.authCodeHint,
      },
    });
    return { ok: true as const, record };
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      const existing = await findInFlightTransferForUserDomain(
        input.userId,
        domain,
      );
      if (existing) {
        return {
          ok: false as const,
          reason: "duplicate_inflight" as const,
          existing,
        };
      }
    }
    throw error;
  }
}
