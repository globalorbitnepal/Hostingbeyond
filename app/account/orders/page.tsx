import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  domainOrderStatusLabel,
  domainOrderTypeLabel,
} from "@/components/panel/domain-order-type-label";
import { PanelEmpty, PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listCustomerDomainOrders } from "@/lib/domains/customer-domain-orders";
import { formatPanelDateTime } from "@/lib/panel/domain-status";

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
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <PanelPageHeader
        eyebrow="Billing"
        title="Domain orders"
        description="Registrations, renewals and transfers charged from your wallet. Totals are in USD, the currency actually billed."
        actions={
          <Link href={routes.accountBilling} className="hb-btn hb-btn-ghost">
            Wallet transactions
          </Link>
        }
      />

      <div className="hb-panel-card p-5">
        {loadError ? (
          <p className="hb-pill hb-pill-danger inline-flex" role="alert">
            Could not load your orders. Please try again shortly.
          </p>
        ) : null}

        {!loadError && orders.length === 0 ? (
          <PanelEmpty
            title="No domain orders yet"
            description="Register or renew a domain and the order will appear here with its reference number."
          >
            <Link
              href={routes.accountDomainFind}
              className="hb-btn hb-btn-primary"
            >
              Search domains
            </Link>
          </PanelEmpty>
        ) : null}

        {!loadError && orders.length > 0 ? (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li
                key={order.publicId}
                className="hb-table-row flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="hb-text font-bold">{order.domain}</p>
                  <p className="hb-muted text-xs">
                    {domainOrderTypeLabel(order.orderType)} ·{" "}
                    {domainOrderStatusLabel(order.status)} ·{" "}
                    {formatPanelDateTime(order.createdAt)}
                  </p>
                  <p className="hb-faint mt-0.5 text-xs">
                    Ref {order.publicId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="hb-text font-bold tabular-nums">
                    {formatMoney(order.total, order.currency)}
                  </p>
                  <Link
                    href={`${routes.accountOrders}/${encodeURIComponent(order.publicId)}`}
                    className="hb-link text-sm"
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
