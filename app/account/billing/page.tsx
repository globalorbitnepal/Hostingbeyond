import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BillingLedgerPanel } from "@/components/panel/billing-ledger-panel";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export default async function AccountBillingPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-slate-950">
          Transactions
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Wallet credits, reserves, and debits. Linked domain orders appear when
          we can match them safely — a completed order does not by itself mean
          funds have settled.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          <Link
            href={routes.accountWallet}
            className="font-semibold text-[#673de6]"
          >
            Wallet balance & top-up
          </Link>
          {" · "}
          <Link
            href={routes.accountOrders}
            className="font-semibold text-[#673de6]"
          >
            Domain orders
          </Link>
          {" · "}
          <Link
            href={routes.accountInvoices}
            className="font-semibold text-[#673de6]"
          >
            Invoices
          </Link>
        </p>
        <BillingLedgerPanel />
      </div>
    </div>
  );
}
