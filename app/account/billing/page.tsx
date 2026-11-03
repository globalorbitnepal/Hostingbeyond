import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BillingLedgerPanel } from "@/components/panel/billing-ledger-panel";
import { PanelPageHeader } from "@/components/panel/panel-ui";
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
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <PanelPageHeader
        eyebrow="Billing"
        title="Transactions"
        description="Wallet credits, reserves and debits. A completed order does not by itself mean funds have settled."
        actions={
          <Link href={routes.accountWallet} className="hb-btn hb-btn-primary">
            Wallet & top up
          </Link>
        }
      />
      <div className="hb-panel-card p-5">
        <BillingLedgerPanel />
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href={routes.accountOrders} className="hb-link">
          Domain orders
        </Link>
        <Link href={routes.accountInvoices} className="hb-link">
          Invoices
        </Link>
      </div>
    </div>
  );
}
