import type Stripe from "stripe";

import { publicId } from "@/lib/domains/transfer-service";
import { listCustomerDomains } from "@/lib/domains/registration-service";
import {
  findNameSiloSslProduct,
  loadNameSiloSslCatalog,
} from "@/lib/panel/namesilo-ssl-catalog";
import {
  readSslBag,
  writeSslBag,
  type StoredSslCertificate,
} from "@/lib/panel/ssl-inventory";
import {
  getAppBaseUrl,
  getStripeClient,
  isStripeConfigured,
} from "@/lib/payments/stripe-config";
import {
  fromProviderMinorUnits,
  toProviderMinorUnits,
} from "@/lib/payments/settlement-currency";
import type { WebhookProcessResult } from "@/lib/payments/wallet-payment-service";

export async function createPremiumSslCheckout(input: {
  userId: string;
  domain: string;
  productId: string;
  idempotencyKey: string;
}): Promise<
  | { ok: true; checkoutUrl: string }
  | {
      ok: false;
      status: number;
      message: string;
    }
> {
  const domain = input.domain.trim().toLowerCase();
  const domains = await listCustomerDomains(input.userId).catch(() => []);
  if (!domains.some((row) => row.domain.toLowerCase() === domain)) {
    return {
      ok: false,
      status: 404,
      message: "That domain is not on this account.",
    };
  }
  const { products } = await loadNameSiloSslCatalog();
  const product = findNameSiloSslProduct(products, input.productId);
  if (!product) {
    return { ok: false, status: 400, message: "Unknown SSL product." };
  }
  if (!isStripeConfigured()) {
    return {
      ok: false,
      status: 503,
      message: "Card checkout is not configured.",
    };
  }

  const bag = await readSslBag(input.userId);
  const existing = bag.certificates.find(
    (row) => row.idempotencyKey === input.idempotencyKey,
  );
  if (existing?.stripeSessionId) {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(
      existing.stripeSessionId,
    );
    if (session.url && session.status === "open") {
      return { ok: true, checkoutUrl: session.url };
    }
  }

  const certId = existing?.id ?? publicId("SSL");
  const pending: StoredSslCertificate = {
    id: certId,
    domain,
    kind: "PREMIUM",
    productId: product.id,
    productName: product.name,
    status: "PENDING",
    issuedAt: null,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastRenewedAt: null,
    chargedAmount: product.priceUsd,
    currency: "USD",
    idempotencyKey: input.idempotencyKey,
  };

  const stripe = getStripeClient();
  const base = getAppBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: toProviderMinorUnits(product.priceUsd, "USD"),
          product_data: {
            name: `${product.name} · ${domain}`,
            description: "NameSilo SSL (1 year, including reissues in term)",
          },
        },
      },
    ],
    metadata: {
      kind: "ssl_certificate",
      userId: input.userId,
      sslCertificateId: certId,
      domain,
      productId: product.id,
      expectedAmount: String(product.priceUsd),
    },
    success_url: `${base}/account/ssl?ssl=processing&cert=${encodeURIComponent(certId)}`,
    cancel_url: `${base}/account/ssl?ssl=cancelled&cert=${encodeURIComponent(certId)}`,
  });

  if (!session.url) {
    return {
      ok: false,
      status: 503,
      message: "Could not start SSL checkout.",
    };
  }

  pending.stripeSessionId = session.id;
  const certificates = bag.certificates.filter((row) => row.id !== certId);
  certificates.push(pending);
  await writeSslBag(input.userId, { certificates });
  return { ok: true, checkoutUrl: session.url };
}

export async function handleSslCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  const userId = session.metadata?.userId?.trim();
  const certId = session.metadata?.sslCertificateId?.trim();
  if (!userId || !certId) {
    return { ok: false, error: "ssl_metadata_missing", status: 400 };
  }
  if (session.payment_status !== "paid") {
    return { ok: false, error: "not_paid", status: 400 };
  }
  const expected = Number(session.metadata?.expectedAmount);
  const currency = (session.currency ?? "usd").toUpperCase();
  if (session.amount_total == null || !Number.isFinite(expected)) {
    return { ok: false, error: "missing_amount", status: 400 };
  }
  const paid = fromProviderMinorUnits(session.amount_total, currency);
  if (Math.abs(paid - expected) > 0.001 || currency !== "USD") {
    return { ok: false, error: "amount_mismatch", status: 400 };
  }

  const bag = await readSslBag(userId);
  const cert = bag.certificates.find((row) => row.id === certId);
  if (!cert) {
    return { ok: false, error: "unknown_ssl_order", status: 400 };
  }
  if (cert.status === "ACTIVE") {
    return { ok: true, handled: true, duplicate: true };
  }
  const now = new Date();
  cert.status = "ACTIVE";
  cert.issuedAt = now.toISOString();
  cert.expiresAt = new Date(
    now.getTime() + 365 * 24 * 60 * 60 * 1000,
  ).toISOString();
  cert.lastRenewedAt = now.toISOString();
  cert.stripeSessionId = session.id;
  await writeSslBag(userId, { certificates: bag.certificates });
  return { ok: true, handled: true };
}
