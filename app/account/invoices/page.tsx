import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { InvoicesPanel } from "@/components/panel/invoices-panel";
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
    <div className="mx-auto max-w-3xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-slate-950">
          Invoices
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Tax amounts are snapshotted at issue time from your order. Legal
          registration details on PDFs are pending owner configuration.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          <Link
            href={routes.accountBilling}
            className="font-semibold text-[#673de6]"
          >
            Transactions
          </Link>
          {" · "}
          <Link
            href={routes.accountOrders}
            className="font-semibold text-[#673de6]"
          >
            Domain orders
          </Link>
        </p>
        <InvoicesPanel />
      </div>
    </div>
  );
}
