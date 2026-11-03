import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { WalletTopUpForm } from "@/components/domains/wallet-top-up-form";
import { WalletAccountPanel } from "@/components/domains/wallet-account-panel";
import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import {
  getWalletPaymentForUser,
  isPaymentProviderConfigured,
} from "@/lib/payments/wallet-payment-service";

export default async function AccountWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ topup?: string; payment?: string }>;
}) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const wallet = await ensureCustomerWallet(user.id);
  const params = await searchParams;
  let topUpStatus = params.topup ?? null;
  const paymentPublicId = params.payment ?? null;
  if (topUpStatus === "processing" && paymentPublicId) {
    const payment = await getWalletPaymentForUser(user.id, paymentPublicId);
    if (payment?.status === "SUCCEEDED") topUpStatus = "success";
    if (payment?.status === "FAILED" || payment?.status === "CANCELLED") {
      topUpStatus = payment.status.toLowerCase();
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PanelPageHeader
        eyebrow="Billing"
        title="Wallet"
        description="Domain registrations, renewals and transfers are paid from your HostingBeyond wallet balance."
      />
      <div className="hb-panel-card p-5 sm:p-7">
        <WalletAccountPanel
          initialBalance={Number(wallet.balance)}
          currency={wallet.currency}
          topUpStatus={topUpStatus}
          paymentPublicId={paymentPublicId}
        />
        <WalletTopUpForm
          paymentProviderConfigured={isPaymentProviderConfigured()}
        />
      </div>
    </div>
  );
}
