import type { DomainOrderStatus, Prisma } from "@prisma/client";

/** Orders that may still consume wallet funds or call the registrar. */
export const INFLIGHT_DOMAIN_ORDER_STATUSES: DomainOrderStatus[] = [
  "PROCESSING",
  "REGISTERING",
  "RECONCILIATION_REQUIRED",
];

export function isInflightDomainOrderStatus(
  status: DomainOrderStatus,
): boolean {
  return INFLIGHT_DOMAIN_ORDER_STATUSES.includes(status);
}

export function inflightDomainOrderFilter(input: {
  domain: string;
  userId?: string;
  orderType?: string;
}): Prisma.DomainOrderWhereInput {
  return {
    domain: input.domain,
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.orderType ? { orderType: input.orderType } : {}),
    status: { in: INFLIGHT_DOMAIN_ORDER_STATUSES },
  };
}
