import { resolveLifecycleProvider } from "@/lib/domains/providers/index";
import { getNameSiloLifecycleProvider } from "@/lib/domains/providers/namesilo-registrar";
import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";
import { prisma } from "@/lib/prisma";

export type RegistrarProviderId = "domain-name-api" | "namesilo";

const DEFAULT_LEGACY_PROVIDER: RegistrarProviderId = "domain-name-api";

function providerById(id: RegistrarProviderId): DomainRegistrarProvider | null {
  if (id === "namesilo") {
    return getNameSiloLifecycleProvider();
  }
  return resolveLifecycleProvider();
}

/**
 * Route lifecycle operations for an existing domain (D5).
 * Existing rows default to domain-name-api until migrated explicitly.
 */
export async function resolveLifecycleProviderForDomain(
  domain: string,
): Promise<DomainRegistrarProvider | null> {
  const normalized = domain.trim().toLowerCase();
  const row = await prisma.domainRegistration.findUnique({
    where: { domain: normalized },
    select: { registrarProvider: true },
  });
  const id = (row?.registrarProvider ??
    DEFAULT_LEGACY_PROVIDER) as RegistrarProviderId;
  return providerById(id);
}

/**
 * Choose registrar for a new registration checkout (not billable until approved).
 * Requires explicit per-TLD lifecycleProvider and verified NameSilo cost when using namesilo.
 */
export async function resolveLifecycleProviderForNewRegistration(
  tld: string,
): Promise<{ provider: DomainRegistrarProvider | null; blockReason?: string }> {
  const key = tld.startsWith(".") ? tld : `.${tld}`;
  const row = await prisma.domainTldPrice.findUnique({
    where: { tld: key },
  });
  const configured = row?.lifecycleProvider as RegistrarProviderId | null;
  if (!configured || configured === DEFAULT_LEGACY_PROVIDER) {
    const dna = resolveLifecycleProvider();
    return dna
      ? { provider: dna }
      : { provider: null, blockReason: "dna_unavailable" };
  }
  if (configured === "namesilo") {
    if (process.env.NAMESILO_LIFECYCLE_ENABLED !== "true") {
      return {
        provider: null,
        blockReason: "namesilo_lifecycle_not_enabled",
      };
    }
    if (
      row?.namesiloPriceStatus !== "verified" ||
      row.namesiloRegister == null
    ) {
      return {
        provider: null,
        blockReason: "namesilo_cost_unverified",
      };
    }
    const ns = getNameSiloLifecycleProvider();
    return ns
      ? { provider: ns }
      : { provider: null, blockReason: "namesilo_unavailable" };
  }
  return { provider: null, blockReason: "unknown_lifecycle_provider" };
}

/**
 * Transfer-in target registrar: existing hosted domains use persisted provider;
 * new transfers use the same eligibility rules as new registrations.
 */
export async function resolveLifecycleProviderForTransfer(
  domain: string,
  tld: string,
): Promise<{ provider: DomainRegistrarProvider | null; blockReason?: string }> {
  const normalized = domain.trim().toLowerCase();
  const existing = await prisma.domainRegistration.findUnique({
    where: { domain: normalized },
    select: { registrarProvider: true, status: true },
  });
  if (existing?.status === "ACTIVE") {
    const provider = await resolveLifecycleProviderForDomain(normalized);
    if (!provider) {
      return { provider: null, blockReason: "registrar_unavailable" };
    }
    return { provider };
  }
  return resolveLifecycleProviderForNewRegistration(tld);
}

export function isAnyLifecycleRegistrarConfigured(): boolean {
  if (resolveLifecycleProvider()) return true;
  return Boolean(process.env.NAMESILO_API_KEY?.trim());
}
