import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  domainOrderStatusLabel,
  domainOrderTypeLabel,
} from "@/components/panel/domain-order-type-label";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { getCustomerDomainOrderByPublicId } from "@/lib/domains/customer-domain-orders";

type Params = { params: Promise<{ publicId: string }> };

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function paymentLabel(
  method: "wallet" | "external" | "none",
  reference: string | null,
): string {
  if (method === "wallet") return "HostingBeyond wallet";
  if (method === "external" && reference) return `External (${reference})`;
  if (method === "external") return "External payment";
  return "Not recorded";
}

export default async function AccountOrderDetailPage({ params }: Params) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const { publicId } = await params;
  const order = await getCustomerDomainOrderByPublicId(
    user.id,
    decodeURIComponent(publicId),
  );
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <Link
          href={routes.accountOrders}
          className="text-sm font-semibold text-[#673de6]"
        >
          ← All orders
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-semibold text-slate-950">
          {order.domain}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {domainOrderTypeLabel(order.orderType)} · Ref {order.publicId}
        </p>

        <dl className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Status</dt>
            <dd className="text-right font-medium text-slate-900">
              {domainOrderStatusLabel(order.status)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Amount</dt>
            <dd className="font-medium text-slate-900 tabular-nums">
              {formatMoney(order.total, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Payment</dt>
            <dd className="text-right font-medium text-slate-900">
              {paymentLabel(order.paymentMethod, order.paymentReference)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Placed</dt>
            <dd className="text-slate-900">
              {new Date(order.createdAt).toLocaleString()}
            </dd>
          </div>
          {order.completedAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Completed</dt>
              <dd className="text-slate-900">
                {new Date(order.completedAt).toLocaleString()}
              </dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          {order.statusMessage}
        </p>

        {order.status === "REGISTERED" && order.orderType === "register" ? (
          <p className="mt-4 text-sm">
            <Link
              href={`${routes.myDomains}/${encodeURIComponent(order.domain)}`}
              className="font-semibold text-[#673de6]"
            >
              Manage domain
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
