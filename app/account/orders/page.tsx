import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  domainOrderStatusLabel,
  domainOrderTypeLabel,
} from "@/components/panel/domain-order-type-label";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerDomainOrders } from "@/lib/domains/customer-domain-orders";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default async function AccountOrdersPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  let orders: Awaited<ReturnType<typeof listCustomerDomainOrders>> = [];
  let loadError = false;
  try {
    orders = await listCustomerDomainOrders(user.id);
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-slate-950">
          Domain orders
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Registrations, renewals, and transfers charged from your wallet. Order
          totals are in USD, the currency actually billed.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          <Link
            href={routes.accountBilling}
            className="font-semibold text-[#673de6]"
          >
            View wallet transactions
          </Link>
        </p>

        {loadError ? (
          <p className="mt-6 text-sm text-red-600" role="alert">
            Could not load your orders. Please try again shortly.
          </p>
        ) : null}

        {!loadError && orders.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">
            No domain orders yet.{" "}
            <Link href={routes.domainSearch} className="text-[#673de6]">
              Search for a domain
            </Link>
          </p>
        ) : null}

        {!loadError && orders.length > 0 ? (
          <ul className="mt-6 divide-y divide-slate-100">
            {orders.map((order) => (
              <li
                key={order.publicId}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{order.domain}</p>
                  <p className="text-xs text-slate-500">
                    {domainOrderTypeLabel(order.orderType)} ·{" "}
                    {domainOrderStatusLabel(order.status)} ·{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Ref {order.publicId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(order.total, order.currency)}
                  </p>
                  <Link
                    href={`${routes.accountOrders}/${encodeURIComponent(order.publicId)}`}
                    className="text-sm font-semibold text-[#673de6]"
                  >
                    Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
