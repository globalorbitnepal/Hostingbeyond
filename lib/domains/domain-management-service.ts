import { DomainProviderError } from "@/lib/domains/providers/types";
import { resolveDomainRegistrarProvider } from "@/lib/domains/providers/index";
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
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  const retail = await getRetailQuoteForTld(owned.registration.tld);
  const provider = resolveDomainRegistrarProvider();
  let nameservers: string[] = [];
  let transferLock = owned.registration.transferLock;
  let providerStatus: string | null = null;

  if (provider) {
    try {
      const details = await provider.getDomainDetails(domain);
      nameservers = details.nameservers;
      transferLock = details.transferLock;
      providerStatus = details.status;
      await prisma.domainRegistration.update({
        where: { id: owned.registration.id },
        data: {
          nameservers: nameservers,
          transferLock,
          expiresAt: details.expiresAt
            ? new Date(details.expiresAt)
            : owned.registration.expiresAt,
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

  return {
    ok: true as const,
    domain: {
      id: owned.registration.id,
      domain: owned.registration.domain,
      status: owned.registration.status,
      registeredAt: owned.registration.registeredAt,
      expiresAt: owned.registration.expiresAt,
      autoRenew: owned.registration.autoRenew,
      nameservers,
      transferLock,
      providerStatus,
      renewalPrice: retail?.renew ?? null,
      currency: retail?.currency ?? "USD",
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

  const cleaned = nameservers
    .map((ns) => ns.trim().toLowerCase())
    .filter(Boolean);
  if (cleaned.length < 2 || cleaned.length > 13) {
    return {
      ok: false as const,
      status: 400,
      error: "Enter at least two valid nameservers.",
    };
  }

  const provider = resolveDomainRegistrarProvider();
  if (!provider) {
    return {
      ok: false as const,
      status: 503,
      error: "Nameserver updates are temporarily unavailable.",
    };
  }

  try {
    await provider.updateNameservers(domain, cleaned);
    await prisma.domainRegistration.update({
      where: { id: owned.registration.id },
      data: { nameservers: cleaned },
    });
    await auditCustomerDomainAction(userId, domain, "DOMAIN_NS_UPDATE", {
      nameservers: cleaned,
    });
    return { ok: true as const, nameservers: cleaned };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: "We could not update nameservers. Please try again.",
    };
  }
}

export async function setCustomerDomainLock(
  userId: string,
  domain: string,
  locked: boolean,
) {
  const owned = await requireActiveDomainRegistration(userId, domain);
  if (!owned.ok) return owned;

  const provider = resolveDomainRegistrarProvider();
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

  const provider = resolveDomainRegistrarProvider();
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
