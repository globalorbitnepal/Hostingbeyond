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
  return storage.getStore() ?? "dna";
}

export { isNameSiloSearchEnabledInEnv } from "@/lib/domains/namesilo-search-env";

/**
 * Customer-facing `/api/domains/search` availability when env enables NameSilo.
 * `searchContext` is accepted for forward compatibility; DNA lifecycle and
 * `/api/domains/validate` are unaffected (they do not use this helper).
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
