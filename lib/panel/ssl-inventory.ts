import { listCustomerDomains } from "@/lib/domains/registration-service";
import { listCustomerHostingPlans } from "@/lib/hosting/customer-hosting-plans";
import {
  customerSslStoreId,
  readCustomerJsonBag,
  writeCustomerJsonBag,
} from "@/lib/panel/customer-json-store";
import {
  letsEncryptPeriodMs,
  nextLetsEncryptExpiry,
} from "@/lib/panel/ssl-dates";

export { nextLetsEncryptExpiry } from "@/lib/panel/ssl-dates";

export type StoredSslCertificate = {
  id: string;
  domain: string;
  kind: "FREE" | "PREMIUM";
  productId: string;
  productName: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED";
  issuedAt: string | null;
  expiresAt: string;
  lastRenewedAt: string | null;
  chargedAmount: number | null;
  currency: string;
  stripeSessionId?: string | null;
  idempotencyKey?: string;
};

type SslBag = { certificates: StoredSslCertificate[] };

export async function readSslBag(userId: string): Promise<SslBag> {
  const bag = await readCustomerJsonBag<SslBag>(customerSslStoreId(userId), {
    certificates: [],
  });
  const certificates = Array.isArray(bag.certificates) ? bag.certificates : [];
  return { certificates };
}

export async function writeSslBag(userId: string, bag: SslBag) {
  await writeCustomerJsonBag(customerSslStoreId(userId), bag);
}

export type SslInventoryRow = {
  domain: string;
  kind: "FREE" | "PREMIUM";
  productName: string;
  status: string;
  expiresAt: string | null;
  lastRenewedAt: string | null;
  canRenewFree: boolean;
  hasActiveHosting: boolean;
  chargedAmount: number | null;
  currency: string;
  certificateId: string | null;
};

export async function listSslInventory(userId: string): Promise<{
  rows: SslInventoryRow[];
  hasActiveHosting: boolean;
}> {
  const [domains, plans, bag] = await Promise.all([
    listCustomerDomains(userId).catch(() => []),
    listCustomerHostingPlans(userId).catch(() => []),
    readSslBag(userId),
  ]);
  const hasActiveHosting = plans.some((plan) => plan.readyForSites);
  const premiumByDomain = new Map<string, StoredSslCertificate>();
  for (const cert of bag.certificates) {
    if (cert.kind !== "PREMIUM") continue;
    const existing = premiumByDomain.get(cert.domain);
    if (!existing || existing.expiresAt < cert.expiresAt) {
      premiumByDomain.set(cert.domain, cert);
    }
  }
  const freeByDomain = new Map<string, StoredSslCertificate>();
  for (const cert of bag.certificates) {
    if (cert.kind !== "FREE") continue;
    freeByDomain.set(cert.domain, cert);
  }

  const rows: SslInventoryRow[] = domains.map((domain) => {
    const premium = premiumByDomain.get(domain.domain);
    if (premium && premium.status !== "EXPIRED") {
      return {
        domain: domain.domain,
        kind: "PREMIUM",
        productName: premium.productName,
        status: premium.status,
        expiresAt: premium.expiresAt,
        lastRenewedAt: premium.lastRenewedAt,
        canRenewFree: false,
        hasActiveHosting,
        chargedAmount: premium.chargedAmount,
        currency: premium.currency,
        certificateId: premium.id,
      };
    }
    const storedFree = freeByDomain.get(domain.domain);
    const expiresAt =
      storedFree?.expiresAt ??
      nextLetsEncryptExpiry(
        domain.registeredAt?.toISOString() ??
          domain.expiresAt?.toISOString() ??
          null,
      );
    return {
      domain: domain.domain,
      kind: "FREE",
      productName: "Free AutoSSL (Let's Encrypt)",
      status: hasActiveHosting ? "ACTIVE" : "PENDING",
      expiresAt,
      lastRenewedAt: storedFree?.lastRenewedAt ?? null,
      canRenewFree: hasActiveHosting,
      hasActiveHosting,
      chargedAmount: 0,
      currency: "USD",
      certificateId: storedFree?.id ?? null,
    };
  });

  return { rows, hasActiveHosting };
}

export async function queueFreeSslRenewal(input: {
  userId: string;
  domain: string;
}): Promise<
  | { ok: true; expiresAt: string }
  | { ok: false; reason: "not_found" | "no_hosting" }
> {
  const { rows, hasActiveHosting } = await listSslInventory(input.userId);
  const row = rows.find(
    (item) => item.domain.toLowerCase() === input.domain.toLowerCase(),
  );
  if (!row) return { ok: false, reason: "not_found" };
  if (!hasActiveHosting || !row.canRenewFree) {
    return { ok: false, reason: "no_hosting" };
  }
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + letsEncryptPeriodMs(),
  ).toISOString();
  const bag = await readSslBag(input.userId);
  const next: StoredSslCertificate = {
    id: row.certificateId ?? `free-${input.domain}`,
    domain: row.domain,
    kind: "FREE",
    productId: "free-autossl",
    productName: row.productName,
    status: "ACTIVE",
    issuedAt: now.toISOString(),
    expiresAt,
    lastRenewedAt: now.toISOString(),
    chargedAmount: 0,
    currency: "USD",
  };
  const certificates = bag.certificates.filter(
    (cert) => !(cert.kind === "FREE" && cert.domain === row.domain),
  );
  certificates.push(next);
  await writeSslBag(input.userId, { certificates });
  return { ok: true, expiresAt };
}
