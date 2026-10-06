import {
  getDomainNameApiAvailabilityProvider,
  getDomainNameApiLifecycleProvider,
} from "@/lib/domains/providers/domain-name-api";
import {
  isDomainNameApiAvailabilityConfigured,
  isDomainNameApiConfigured,
  isDomainNameApiLifecycleConfigured,
} from "@/lib/domains/providers/domain-name-api-config";
import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";

export function resolveAvailabilityProvider(): DomainRegistrarProvider | null {
  const live = getDomainNameApiAvailabilityProvider();
  if (live) return live;
  return null;
}

/** OTE/test by default — registration, renewal, transfer. */
export function resolveLifecycleProvider(): DomainRegistrarProvider | null {
  return getDomainNameApiLifecycleProvider();
}

/** @deprecated use resolveLifecycleProvider */
export function resolveDomainRegistrarProvider(): DomainRegistrarProvider | null {
  return resolveLifecycleProvider();
}

export function isAvailabilityProviderConfigured(): boolean {
  if (isDomainNameApiAvailabilityConfigured()) return true;
  return Boolean(process.env.DOMAIN_LOOKUP_URL?.trim());
}

export function isDomainProviderConfigured(): boolean {
  if (isAvailabilityProviderConfigured()) return true;
  if (isDomainNameApiLifecycleConfigured()) return true;
  return Boolean(process.env.DOMAIN_LOOKUP_URL?.trim());
}

export {
  isDomainNameApiConfigured,
  isDomainNameApiAvailabilityConfigured,
  isDomainNameApiLifecycleConfigured,
};
