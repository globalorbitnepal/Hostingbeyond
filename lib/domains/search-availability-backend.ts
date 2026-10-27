import { AsyncLocalStorage } from "node:async_hooks";

import { isNameSiloSearchEnabledInEnv } from "@/lib/domains/namesilo-search-env";
import { isAvailabilityProviderConfigured } from "@/lib/domains/providers/index";

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
  return (
    storage.getStore() ?? (isNameSiloSearchEnabledInEnv() ? "namesilo" : "dna")
  );
}

export { isNameSiloSearchEnabledInEnv } from "@/lib/domains/namesilo-search-env";

/**
 * Customer-facing `/api/domains/search` and transfer eligibility.
 * NameSilo when API key is set; DNA only if the provider flag is explicitly `dna`.
 */
export function resolveSearchRouteAvailabilityBackend(
  _searchContext?: string,
): SearchAvailabilityBackend {
  if (isNameSiloSearchEnabledInEnv()) return "namesilo";
  return "dna";
}

/** True when customer search can call a live registrar (NameSilo or DNA), not legacy proxy only. */
export function isLiveRegistrarSearchConfigured(): boolean {
  if (isNameSiloSearchEnabledInEnv()) return true;
  return isAvailabilityProviderConfigured();
}

export function shouldUseNameSiloForCurrentSearch(): boolean {
  return (
    getSearchAvailabilityBackend() === "namesilo" &&
    isNameSiloSearchEnabledInEnv()
  );
}
