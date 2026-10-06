import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/auth/brand-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import { WalletTopUpForm } from "@/components/domains/wallet-top-up-form";
import { WalletAccountPanel } from "@/components/domains/wallet-account-panel";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { ensureCustomerWallet } from "@/lib/domains/wallet";
import {
  getWalletPaymentForUser,
  isPaymentProviderConfigured,
} from "@/lib/payments/wallet-payment-service";
import { routes } from "@/config/routes";

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
    <div className="hb-band-cream min-h-dvh px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <BrandMark />
          </Link>
          <LogoutButton />
        </div>
        <div className="mt-10 rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]">
          <Link
            href={routes.account}
            className="text-sm font-semibold text-[#673de6]"
          >
            ← Account
          </Link>
          <h1 className="font-heading mt-4 text-2xl font-semibold text-slate-950">
            Wallet
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Domain registrations, renewals, and transfers use your HostingBeyond
            wallet balance.
          </p>
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
    </div>
  );
}
