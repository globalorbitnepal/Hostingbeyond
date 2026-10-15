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
import { parseDomainListFromSearchParams } from "@/lib/domains/domain-purchase-intent";
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

  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );

  if (transferRaw) {
    const transferPath = `${routes.domainCheckout}?transfer=${encodeURIComponent(transferRaw)}`;
    if (!user) {
      redirect(`${routes.login}?next=${encodeURIComponent(transferPath)}`);
    }
    const check = await checkTransferEligibilityAsync(transferRaw);
    if (!check.eligible || check.transferPrice == null) {
      redirect(
        `${routes.domainTransfer}?domain=${encodeURIComponent(transferRaw)}#transfer-check`,
      );
    }
    const wallet = await ensureCustomerWallet(user.id);
    return (
      <DomainTransferCheckoutView
        domain={check.domain}
        transferPrice={check.transferPrice}
        renewPrice={check.renewPrice ?? 0}
        currency="USD"
        walletBalance={Number(wallet.balance)}
      />
    );
  }

  const domainsFromUrl = parseDomainListFromSearchParams(params);
  const offers = await getDomainCheckoutOffers();

  if (user && domainsFromUrl.length) {
    await mergeUrlDomainsIntoCart(user.id, domainsFromUrl);
    redirect(routes.domainCheckout);
  }

  if (user) {
    const checkout = await loadCheckoutCart(user.id);
    const wallet = await ensureCustomerWallet(user.id);

    return (
      <DomainCheckoutView
        isAuthenticated
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

  return (
    <DomainCheckoutView
      isAuthenticated={false}
      lines={[]}
      walletBalance={0}
      walletCurrency="USD"
      paymentProviderReady={isPaymentProviderConfigured()}
      offers={offers}
      customerEmail=""
      customerName={null}
    />
  );
}
