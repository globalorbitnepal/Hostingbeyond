import type { ProviderTransferResult } from "@/lib/domains/providers/provider";

/** Map a successful NameSilo transferDomain reply (HTTP code 300). */
export function mapNameSiloTransferReply(
  domain: string,
  reply: Record<string, unknown>,
): ProviderTransferResult {
  const order =
    reply.order_id ?? reply.orderId ?? reply.orderid ?? reply.message;
  return {
    outcome: "success",
    domain: domain.trim().toLowerCase(),
    status: "SUBMITTED",
    providerTransferId:
      order != null && String(order).trim() ? String(order) : undefined,
  };
}
