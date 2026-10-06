import { getDomainNameApiProvider } from "@/lib/domains/providers/domain-name-api";
import { isDomainNameApiConfigured } from "@/lib/domains/providers/domain-name-api-config";
import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";

export function isDomainProviderConfigured(): boolean {
  if (isDomainNameApiConfigured()) return true;
  return Boolean(process.env.DOMAIN_LOOKUP_URL?.trim());
}

export function resolveDomainRegistrarProvider(): DomainRegistrarProvider | null {
  const dna = getDomainNameApiProvider();
  if (dna) return dna;
  return null;
}

export { isDomainNameApiConfigured };
