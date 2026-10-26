/**
 * Public domain search availability only — not registration/transfer lifecycle.
 * Production policy: NameSilo is used only when explicitly selected via env flag.
 */
export function isNameSiloSearchEnabledInEnv(): boolean {
  const flag =
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER?.trim().toLowerCase() ??
    "";
  if (flag !== "namesilo") return false;
  return Boolean(process.env.NAMESILO_API_KEY?.trim());
}
