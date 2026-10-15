/** Statuses that block starting another transfer checkout for the same user+domain. */
export const TRANSFER_IN_PROGRESS_STATUSES = [
  "PENDING_PAYMENT",
  "SUBMITTED",
  "IN_PROGRESS",
  "PAID",
] as const;

/**
 * Safe internal note for DB — never persist raw provider bodies or auth codes.
 */
export function internalTransferErrorNote(
  code?: string | null,
  fallback = "transfer_failed",
): string {
  const raw = (code ?? fallback).trim();
  const safe = raw.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 64);
  return safe.length > 0 ? safe : "transfer_failed";
}
