/** Per-TLD NameSilo supplier price verification (stored in `namesiloPriceStatus`). */
export type NameSiloCataloguePriceStatus =
  "verified" | "partial" | "unverified" | "missing" | "invalid" | "stale";

export type NameSiloOperationCosts = {
  register: number | null;
  renew: number | null;
  transfer: number | null;
};

export function deriveNameSiloCatalogueStatus(
  costs: NameSiloOperationCosts,
  opts?: { hadInvalidField?: boolean; onApi?: boolean },
): NameSiloCataloguePriceStatus {
  if (opts?.onApi === false) return "missing";
  if (opts?.hadInvalidField) return "invalid";
  const vals = [costs.register, costs.renew, costs.transfer];
  const present = vals.filter((v) => v != null && Number.isFinite(v)).length;
  if (present === 0) return "missing";
  if (present === 3) return "verified";
  if (costs.register != null && Number.isFinite(costs.register))
    return "partial";
  return "unverified";
}

/** Merge API values onto DB — never replace a valid stored cost with null/invalid. */
export function mergeNameSiloCostField(
  previous: number | null,
  incoming: number | null,
): number | null {
  if (incoming != null && Number.isFinite(incoming)) return incoming;
  return previous;
}

export function mergeNameSiloCosts(
  previous: NameSiloOperationCosts,
  incoming: NameSiloOperationCosts,
): NameSiloOperationCosts {
  return {
    register: mergeNameSiloCostField(previous.register, incoming.register),
    renew: mergeNameSiloCostField(previous.renew, incoming.renew),
    transfer: mergeNameSiloCostField(previous.transfer, incoming.transfer),
  };
}
