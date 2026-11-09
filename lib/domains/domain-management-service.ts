import { defaultNameservers } from "@/lib/domains/contacts";
import { normalizeNameserverList } from "@/lib/domains/nameserver-host";
import { DomainProviderError } from "@/lib/domains/providers/types";
import { resolveLifecycleProviderForDomain } from "@/lib/domains/registrar-router";
import { requireActiveDomainRegistration } from "@/lib/domains/require-domain-ownership";
import { getRetailQuoteForTld } from "@/lib/domains/pricing-engine";
import { prisma } from "@/lib/prisma";

const authCodeBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitAuthCode(userId: string): boolean {
  const now = Date.now();
  const bucket = authCodeBuckets.get(userId);
  if (!bucket || now > bucket.resetAt) {
    authCodeBuckets.set(userId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (bucket.count >= 5) return false;
  bucket.count += 1;
  return true;
}

async function auditCustomerDomainAction(
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

export async function getCustomerDomainDetail(userId: string, domain: string) {
  const normalized = domain.trim().toLowerCase();
  const registration = await prisma.domainRegistration.findFirst({
    where: { userId, domain: normalized },
  });
  if (!registration) {
    return { ok: false as const, status: 404, error: "Domain not found." };
  }

  const retail = await getRetailQuoteForTld(registration.tld);
  let nameservers: string[] = [];
  let transferLock = registration.transferLock;
  let providerStatus: string | null = null;
  let privacyEnabled: boolean | null = null;

  /**
   * Only live registrations have a provider record to query. Pending ones must
   * still render in the panel so the customer sees an honest "setting up"
   * state instead of a 404 on the page they were just linked to.
   */
  const provider =
    registration.status === "ACTIVE"
      ? await resolveLifecycleProviderForDomain(normalized)
      : null;

  if (provider) {
    try {
      const details = await provider.getDomainDetails(normalized);
      nameservers = details.nameservers;
      transferLock = details.transferLock;
      providerStatus = details.status;
      privacyEnabled =
        typeof details.privacyEnabled === "boolean"
          ? details.privacyEnabled
          : null;
      await prisma.domainRegistration.update({
        where: { id: registration.id },
        data: {
          nameservers: nameservers,
          transferLock,
          expiresAt: details.expiresAt
            ? new Date(details.expiresAt)
            : registration.expiresAt,
        },
      });
    } catch (error) {
      if (
        error instanceof DomainProviderError &&
        error.code === "domain_not_found"
      ) {
        providerStatus = "pending_sync";
      }
    }
  }

  const storedNameservers = Array.isArray(registration.nameservers)
    ? (registration.nameservers as unknown[]).filter(
        (entry): entry is string => typeof entry === "string",
      )
    : [];

  return {
    ok: true as const,
    domain: {
      id: registration.id,
      domain: registration.domain,
      status: registration.status,
      registeredAt: registration.registeredAt,
      expiresAt: registration.expiresAt,
      autoRenew: registration.autoRenew,
      nameservers: nameservers.length > 0 ? nameservers : storedNameservers,
      transferLock,
      providerStatus,
      renewalPrice: retail?.renew ?? null,
      currency: retail?.currency ?? "USD",
      defaultNameservers: defaultNameservers(),
      privacyEnabled,
      registrarProvider: registration.registrarProvider,
    },
  };
}

export async function updateCustomerNameservers(
  userId: string,
  domain: string,
  nameservers: string[],
) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  const normalized = normalizeNameserverList(nameservers);
  if (!normalized.ok) {
    return {
      ok: false as const,
      status: 400,
      error: normalized.error,
    };
  }
  const hosts = normalized.nameservers;

  const provider = await resolveLifecycleProviderForDomain(domain);
  if (!provider) {
    return {
      ok: false as const,
      status: 503,
      error: "Nameserver updates are temporarily unavailable.",
    };
  }

  try {
    await provider.updateNameservers(domain, hosts);
    await prisma.domainRegistration.update({
      where: { id: owned.registration.id },
      data: { nameservers: hosts },
    });
    await auditCustomerDomainAction(userId, domain, "DOMAIN_NS_UPDATE", {
      nameservers: hosts,
    });
    return { ok: true as const, nameservers: hosts };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: "We could not update nameservers. Please try again.",
    };
  }
}

export async function setCustomerDomainAutoRenew(
  userId: string,
  domain: string,
  autoRenew: boolean,
) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  await prisma.domainRegistration.update({
    where: { id: owned.registration.id },
    data: { autoRenew },
  });
  await auditCustomerDomainAction(
    userId,
    domain,
    autoRenew ? "DOMAIN_AUTORENEW_ON" : "DOMAIN_AUTORENEW_OFF",
  );
  return { ok: true as const, autoRenew };
}

export async function setCustomerDomainLock(
  userId: string,
  domain: string,
  locked: boolean,
) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  const provider = await resolveLifecycleProviderForDomain(domain);
  if (!provider) {
    return {
      ok: false as const,
      status: 503,
      error: "Domain lock is temporarily unavailable.",
    };
  }

  try {
    if (locked) await provider.lockDomain(domain);
    else await provider.unlockDomain(domain);
    await prisma.domainRegistration.update({
      where: { id: owned.registration.id },
      data: { transferLock: locked },
    });
    await auditCustomerDomainAction(
      userId,
      domain,
      locked ? "DOMAIN_LOCK" : "DOMAIN_UNLOCK",
    );
    return { ok: true as const, transferLock: locked };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: "We could not update transfer lock. Please try again.",
    };
  }
}

export async function getCustomerAuthCode(userId: string, domain: string) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  if (!rateLimitAuthCode(userId)) {
    return {
      ok: false as const,
      status: 429,
      error: "Too many auth code requests. Please try again later.",
    };
  }

  const provider = await resolveLifecycleProviderForDomain(domain);
  if (!provider) {
    return {
      ok: false as const,
      status: 503,
      error: "Auth code retrieval is temporarily unavailable.",
    };
  }

  try {
    const authCode = await provider.getAuthCode(domain);
    await auditCustomerDomainAction(userId, domain, "DOMAIN_AUTH_CODE_VIEW");
    return { ok: true as const, authCode };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: "We could not retrieve the auth code. Please try again.",
    };
  }
}
