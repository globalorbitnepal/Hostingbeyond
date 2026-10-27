/**
 * Public domain search / transfer eligibility availability.
 * NameSilo is the production registrar when NAMESILO_API_KEY is set.
 * DNA remains only when DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER=dna.
 */
export function isNameSiloSearchEnabledInEnv(): boolean {
  const flag =
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER?.trim().toLowerCase() ??
    "";
  if (flag === "dna") return false;
  return Boolean(process.env.NAMESILO_API_KEY?.trim());
}
