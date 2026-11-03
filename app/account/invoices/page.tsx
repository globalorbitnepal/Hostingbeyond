import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { InvoicesPanel } from "@/components/panel/invoices-panel";
import { PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export default async function AccountInvoicesPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <PanelPageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Tax is snapshotted at issue time. Invoice totals are in USD, the billed currency, not a display estimate."
        actions={
          <Link href={routes.accountBilling} className="hb-btn hb-btn-ghost">
            Transactions
          </Link>
        }
      />
      <div className="hb-panel-card p-5">
        <InvoicesPanel />
      </div>
    </div>
  );
}
