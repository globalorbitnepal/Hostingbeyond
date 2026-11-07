/**
 * Shared server-side env flag parsing.
 *
 * Kept in `lib/config` so security helpers, capability gates, and payment code
 * can share one definition without importing the CSRF module. Only explicit
 * opt-in values are truthy; anything else fails closed.
 */
export function isTruthyEnvFlag(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
