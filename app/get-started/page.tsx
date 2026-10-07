import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { DomainCheckoutView } from "@/components/domains/domain-checkout-view";
import { DomainTransferCheckoutView } from "@/components/domains/domain-transfer-checkout-view";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import {
  loadCheckoutCart,
  mergeUrlDomainsIntoCart,
} from "@/lib/domains/domain-cart-service";
import {
  loginPathForDomainCheckout,
  parseDomainListFromSearchParams,
} from "@/lib/domains/domain-purchase-intent";
import { checkTransferEligibilityAsync } from "@/lib/domains/transfer-service";
import { getDomainCheckoutOffers } from "@/lib/domains/domain-checkout-offers";
import { isPaymentProviderConfigured } from "@/lib/domains/wallet-top-up";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Domain checkout — HostingBeyond",
  description: "Complete your domain registration securely with HostingBeyond.",
  robots: { index: false, follow: false },
};

export default async function GetStartedDomainCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const transferRaw =
    typeof params.transfer === "string" ? params.transfer.trim() : "";
  const authRaw = typeof params.auth === "string" ? params.auth.trim() : "";

  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );

  if (transferRaw) {
    if (!user) {
      redirect(
        `${routes.login}?next=${encodeURIComponent(
          `${routes.domainCheckout}?transfer=${encodeURIComponent(transferRaw)}${authRaw ? `&auth=${encodeURIComponent(authRaw)}` : ""}`,
        )}`,
      );
    }
    if (!authRaw) {
      redirect(
        `${routes.domainTransfer}?domain=${encodeURIComponent(transferRaw)}#transfer-check`,
      );
    }
    const check = await checkTransferEligibilityAsync(transferRaw, authRaw);
    if (!check.eligible) {
      redirect(
        `${routes.domainTransfer}?domain=${encodeURIComponent(transferRaw)}#transfer-check`,
      );
    }
    const wallet = await ensureCustomerWallet(user.id);
    return (
      <DomainTransferCheckoutView
        domain={check.domain}
        authCode={authRaw}
        transferPrice={check.transferPrice ?? 0}
        renewPrice={check.renewPrice ?? 0}
        currency="USD"
        walletBalance={Number(wallet.balance)}
      />
    );
  }

  const domainsFromUrl = parseDomainListFromSearchParams(params);

  if (!user) {
    if (domainsFromUrl.length) {
      redirect(loginPathForDomainCheckout(domainsFromUrl));
    }
    redirect(routes.domainSearch);
  }

  if (domainsFromUrl.length) {
    await mergeUrlDomainsIntoCart(user.id, domainsFromUrl);
    redirect(routes.domainCheckout);
  }

  const checkout = await loadCheckoutCart(user.id);
  if (!checkout.snapshot.items.length) {
    const err =
      checkout.rejected.length > 0
        ? "Some domains in your cart are no longer available."
        : "Your cart is empty.";
    redirect(
      `${routes.domainSearch}?checkout_error=${encodeURIComponent(err)}`,
    );
  }

  const [wallet, offers] = await Promise.all([
    ensureCustomerWallet(user.id),
    getDomainCheckoutOffers(),
  ]);

  return (
    <DomainCheckoutView
      lines={checkout.snapshot.items.map((item) => ({
        domain: item.domain,
        status: item.status,
        register: item.register,
        renew: item.renew,
        currency: item.currency,
      }))}
      walletBalance={Number(wallet.balance)}
      walletCurrency={wallet.currency}
      paymentProviderReady={isPaymentProviderConfigured()}
      cartRejected={checkout.rejected}
      priceChanges={checkout.priceChanges}
      requiresPriceConfirmation={checkout.requiresConfirmation}
      offers={offers}
      customerEmail={user.email}
      customerName={user.name}
    />
  );
}
