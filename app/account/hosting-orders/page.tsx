import type { HostingOrderStatus } from "@prisma/client";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelEmpty, PanelPageHeader } from "@/components/panel/panel-ui";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listHostingOrdersForUser } from "@/lib/hosting/hosting-orders";
import { HOSTING_ORDER_STATUS_LABELS } from "@/lib/hosting/provisioning";
import { formatPanelDateTime } from "@/lib/panel/domain-status";

function orderStatusLabel(status: string) {
  return HOSTING_ORDER_STATUS_LABELS[status as HostingOrderStatus] ?? status;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default async function AccountHostingOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const paymentNotice =
    params.payment === "processing"
      ? "If you completed payment, this page updates to Paid after our payment provider confirms it. Hosting is not activated automatically yet."
      : params.payment === "cancelled"
        ? "Payment was cancelled. You can return to checkout to try again."
        : null;

  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const orders = await listHostingOrdersForUser(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <PanelPageHeader
        eyebrow="Hosting"
        title="Hosting orders"
        description="Only orders marked Active represent live hosting. Amounts are in USD, the currency actually billed."
        actions={
          <Link href={routes.accountHosting} className="hb-btn hb-btn-primary">
            Browse plans
          </Link>
        }
      />

      {paymentNotice ? (
        <p className="hb-pill hb-pill-info inline-flex" role="status">
          {paymentNotice}
        </p>
      ) : null}

      <div className="hb-panel-card p-5">
        {orders.length === 0 ? (
          <PanelEmpty
            title="No hosting orders yet"
            description="Pick a hosting plan and the order will show here with its activation status."
          >
            <Link
              href={routes.accountHosting}
              className="hb-btn hb-btn-primary"
            >
              Hosting plans
            </Link>
          </PanelEmpty>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => {
              const snap = order.lineItemsSnapshot as {
                planName?: string;
              } | null;
              const label =
                snap?.planName ?? `${order.productSlug} · ${order.planKey}`;
              const active =
                order.status === "ACTIVE" || order.status === "PROVISIONING";
              return (
                <li
                  key={order.id}
                  className="hb-table-row flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="hb-text font-bold">{label}</p>
                    <p className="hb-muted text-xs">
                      {orderStatusLabel(order.status)} · {order.billingCycle} ·{" "}
                      {formatPanelDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`hb-pill ${active ? "hb-pill-ok" : "hb-pill-neutral"}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                    <p className="hb-text font-bold tabular-nums">
                      {formatMoney(Number(order.total), order.currency)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
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
