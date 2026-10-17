import type { InvoiceStatus } from "@prisma/client";

export function voidRejectionReason(status: InvoiceStatus): string | null {
  if (status === "VOID") return null;
  if (status === "PAID") return "void_not_allowed_for_paid";
  if (status === "ISSUED") return null;
  return "void_not_allowed";
}
