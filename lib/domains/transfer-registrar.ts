import {
  type RegistrarProviderId,
  resolveLifecycleProviderForTransfer,
} from "@/lib/domains/registrar-router";
import { resolveLifecycleProvider } from "@/lib/domains/providers/index";
import type { DomainRegistrarProvider } from "@/lib/domains/providers/provider";
import { getNameSiloLifecycleProvider } from "@/lib/domains/providers/namesilo-registrar";

const LEGACY_DEFAULT_PROVIDER: RegistrarProviderId = "domain-name-api";

export type TransferRecordRouting = {
  domain: string;
  tld: string;
  registrarProvider: string | null;
};

function providerById(id: RegistrarProviderId): DomainRegistrarProvider | null {
  if (id === "namesilo") {
    return getNameSiloLifecycleProvider();
  }
  return resolveLifecycleProvider();
}

/**
 * Authoritative registrar for transfer status polling.
 * Uses persisted `registrarProvider` from checkout — never re-resolves from current TLD config.
 */
export function resolveProviderForTransferRecord(
  record: TransferRecordRouting,
): { provider: DomainRegistrarProvider | null; blockReason?: string } {
  const persisted = record.registrarProvider?.trim();
  if (persisted) {
    const id = persisted as RegistrarProviderId;
    if (id !== "domain-name-api" && id !== "namesilo") {
      return { provider: null, blockReason: "unknown_registrar_provider" };
    }
    const provider = providerById(id);
    if (!provider) {
      return { provider: null, blockReason: "registrar_unavailable" };
    }
    return { provider };
  }

  const legacy = providerById(LEGACY_DEFAULT_PROVIDER);
  if (legacy) {
    return { provider: legacy };
  }
  return { provider: null, blockReason: "dna_unavailable" };
}

/** Registrar selected at checkout before provider.transferDomain — becomes authoritative. */
export async function resolveTransferTargetRegistrar(
  domain: string,
  tld: string,
): Promise<{ provider: DomainRegistrarProvider | null; blockReason?: string }> {
  return resolveLifecycleProviderForTransfer(domain, tld);
}

export function registrarProviderIdFromProvider(
  provider: DomainRegistrarProvider,
): RegistrarProviderId {
  return provider.id === "namesilo" ? "namesilo" : "domain-name-api";
}
