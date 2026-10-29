export type HostingBillingPeriod = "monthly" | "annually";

/** Annual promo copy (e.g. "Save 70%") must not render on monthly billing. */
export function annualSaveBadgeLabel(
  billing: HostingBillingPeriod,
  badge: string | undefined | null,
): string | null {
  const trimmed = badge?.trim();
  if (billing !== "annually" || !trimmed) return null;
  return trimmed;
}
