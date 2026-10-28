import type { HostingOrderStatus } from "@prisma/client";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { listHostingOrdersForUser } from "@/lib/hosting/hosting-orders";
import { HOSTING_ORDER_STATUS_LABELS } from "@/lib/hosting/provisioning";

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
      ? "If you completed payment, this page will update to Paid after our payment provider confirms it. Hosting is not activated automatically yet."
      : params.payment === "cancelled"
        ? "Payment was cancelled. You can return to checkout to try again when online payment is available."
        : null;

  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const orders = await listHostingOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-slate-950">
          Hosting orders
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Web hosting checkout orders for your account. Service provisioning is
          not automated yet — only orders marked Active represent live hosting.
          Amounts are in USD, the currency actually billed.
        </p>
        {paymentNotice ? (
          <p
            className="mt-4 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950"
            role="status"
          >
            {paymentNotice}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-500">
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

        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">
            No hosting orders yet.{" "}
            <Link
              href={routes.pricing}
              className="font-semibold text-[#673de6]"
            >
              Browse hosting plans
            </Link>
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100">
            {orders.map((order) => {
              const snap = order.lineItemsSnapshot as {
                planName?: string;
              } | null;
              const label =
                snap?.planName ?? `${order.productSlug} · ${order.planKey}`;
              return (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">
                      {orderStatusLabel(order.status)} · {order.billingCycle} ·{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(Number(order.total), order.currency)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
