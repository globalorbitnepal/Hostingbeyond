import type { ProviderDnsRecord } from "@/lib/domains/providers/provider";
import {
  validateDnsRecordInput,
  type DnsRecordFormInput,
} from "@/lib/domains/providers/namesilo-dns";
import { DomainProviderError } from "@/lib/domains/providers/types";
import { resolveLifecycleProviderForDomain } from "@/lib/domains/registrar-router";
import { requireActiveDomainRegistration } from "@/lib/domains/require-domain-ownership";
import { prisma } from "@/lib/prisma";

async function audit(
  userId: string,
  domain: string,
  action: string,
  details?: Record<string, unknown>,
) {
  await prisma.domainAuditLog.create({
    data: {
      action,
      resource: "DomainRegistration",
      resourceId: domain,
      details: { userId, ...details },
    },
  });
}

type Fail = { ok: false; status: number; error: string };

const UNAVAILABLE: Fail = {
  ok: false,
  status: 503,
  error: "DNS editing is temporarily unavailable for this domain.",
};

async function resolveDnsProvider(domain: string) {
  const provider = await resolveLifecycleProviderForDomain(domain);
  if (
    !provider ||
    !provider.listDnsRecords ||
    !provider.supportsDnsEditing?.()
  ) {
    return null;
  }
  return provider;
}

export async function listCustomerDnsRecords(userId: string, domain: string) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  const provider = await resolveDnsProvider(domain);
  if (!provider) return UNAVAILABLE;

  try {
    const records = await provider.listDnsRecords!(domain);
    return { ok: true as const, records, domain: owned.registration.domain };
  } catch (error) {
    const code = error instanceof DomainProviderError ? error.code : "unknown";
    return {
      ok: false as const,
      status: 502,
      error:
        code === "provider_failure"
          ? "The registrar rejected the DNS request. Try again shortly."
          : "We could not load DNS records for this domain.",
    };
  }
}

export async function createCustomerDnsRecord(
  userId: string,
  domain: string,
  input: DnsRecordFormInput,
) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  const validated = validateDnsRecordInput(input, owned.registration.domain);
  if (!validated.ok) {
    return { ok: false as const, status: 400, error: validated.error };
  }

  const provider = await resolveDnsProvider(domain);
  if (!provider?.addDnsRecord) return UNAVAILABLE;

  try {
    const record = await provider.addDnsRecord(
      owned.registration.domain,
      validated.record,
    );
    await audit(userId, owned.registration.domain, "DOMAIN_DNS_CREATE", {
      type: validated.record.type,
      host: validated.record.host,
    });
    return { ok: true as const, record };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: "The registrar could not create that record. Check the values.",
    };
  }
}

export async function updateCustomerDnsRecord(
  userId: string,
  domain: string,
  recordId: string,
  input: DnsRecordFormInput,
) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  if (!recordId?.trim()) {
    return { ok: false as const, status: 400, error: "Missing record id." };
  }

  const validated = validateDnsRecordInput(input, owned.registration.domain);
  if (!validated.ok) {
    return { ok: false as const, status: 400, error: validated.error };
  }

  const provider = await resolveDnsProvider(domain);
  if (!provider?.updateDnsRecord) return UNAVAILABLE;

  try {
    await provider.updateDnsRecord(owned.registration.domain, {
      ...validated.record,
      recordId: recordId.trim(),
    });
    await audit(userId, owned.registration.domain, "DOMAIN_DNS_UPDATE", {
      type: validated.record.type,
      host: validated.record.host,
      recordId: recordId.trim(),
    });
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: "The registrar could not update that record.",
    };
  }
}

export async function deleteCustomerDnsRecord(
  userId: string,
  domain: string,
  recordId: string,
) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  if (!recordId?.trim()) {
    return { ok: false as const, status: 400, error: "Missing record id." };
  }

  const provider = await resolveDnsProvider(domain);
  if (!provider?.deleteDnsRecord) return UNAVAILABLE;

  try {
    await provider.deleteDnsRecord(owned.registration.domain, recordId.trim());
    await audit(userId, owned.registration.domain, "DOMAIN_DNS_DELETE", {
      recordId: recordId.trim(),
    });
    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: "The registrar could not delete that record.",
    };
  }
}

export type { ProviderDnsRecord };
