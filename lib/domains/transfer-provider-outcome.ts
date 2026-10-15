import type { ProviderTransferResult } from "@/lib/domains/providers/provider";

export type TransferProviderAction =
  { action: "submitted" } | { action: "reconciliation" } | { action: "failed" };

/** Maps registrar transfer API outcome to wallet + record handling (no side effects). */
export function resolveTransferProviderAction(
  outcome: ProviderTransferResult,
): TransferProviderAction {
  if (outcome.outcome === "unknown") {
    return { action: "reconciliation" };
  }
  if (outcome.outcome === "failed") {
    return { action: "failed" };
  }
  return { action: "submitted" };
}
