import { AsyncLocalStorage } from "node:async_hooks";

/** Which upstream performs availability for the current domain search request. */
export type SearchAvailabilityBackend = "dna" | "namesilo";

export const DOMAIN_PAGE_SEARCH_CONTEXT = "domain-page";

const storage = new AsyncLocalStorage<SearchAvailabilityBackend>();

export function runWithSearchAvailabilityBackend<T>(
  backend: SearchAvailabilityBackend,
  fn: () => T,
): T {
  return storage.run(backend, fn);
}

export function getSearchAvailabilityBackend(): SearchAvailabilityBackend {
  return storage.getStore() ?? "dna";
}

export function isNameSiloSearchEnabledInEnv(): boolean {
  const flag =
    process.env.DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER?.trim().toLowerCase() ??
    "";
  if (flag !== "namesilo") return false;
  return Boolean(process.env.NAMESILO_API_KEY?.trim());
}

/**
 * Customer-facing `/api/domains/search` availability when env enables NameSilo.
 * `searchContext` is accepted for forward compatibility; DNA lifecycle and
 * `/api/domains/validate` are unaffected (they do not use this helper).
 */
export function resolveSearchRouteAvailabilityBackend(
  _searchContext?: string,
): SearchAvailabilityBackend {
  if (!isNameSiloSearchEnabledInEnv()) return "dna";
  return "namesilo";
}

export function shouldUseNameSiloForCurrentSearch(): boolean {
  return (
    getSearchAvailabilityBackend() === "namesilo" &&
    isNameSiloSearchEnabledInEnv()
  );
}
