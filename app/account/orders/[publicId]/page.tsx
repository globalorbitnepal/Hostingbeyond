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
import { formatPanelDateTime } from "@/lib/panel/domain-status";
import { parseCustomerDomainOrderPublicId } from "@/lib/domains/customer-domain-public-id";

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
  const parsedId = parseCustomerDomainOrderPublicId(
    decodeURIComponent(publicId),
  );
  if (!parsedId) notFound();
  const order = await getCustomerDomainOrderByPublicId(user.id, parsedId);
  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="hb-panel-card p-6 sm:p-8">
        <Link href={routes.accountOrders} className="hb-link text-sm">
          ← All orders
        </Link>
        <h1 className="hb-h1 mt-4">{order.domain}</h1>
        <p className="hb-muted mt-1 text-sm">
          {domainOrderTypeLabel(order.orderType)} · Ref {order.publicId}
        </p>

        <dl className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="hb-muted">Status</dt>
            <dd className="hb-text text-right font-semibold">
              {domainOrderStatusLabel(order.status)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="hb-muted">Amount</dt>
            <dd className="hb-text font-semibold tabular-nums">
              {formatMoney(order.total, order.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="hb-muted">Payment</dt>
            <dd className="hb-text text-right font-semibold">
              {paymentLabel(order.paymentMethod, order.paymentReference)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="hb-muted">Placed</dt>
            <dd className="hb-text">{formatPanelDateTime(order.createdAt)}</dd>
          </div>
          {order.completedAt ? (
            <div className="flex justify-between gap-4">
              <dt className="hb-muted">Completed</dt>
              <dd className="hb-text">
                {formatPanelDateTime(order.completedAt)}
              </dd>
            </div>
          ) : null}
        </dl>

        <p className="hb-soft hb-muted mt-6 p-4 text-sm">
          {order.statusMessage}
        </p>

        {order.status === "REGISTERED" && order.orderType === "register" ? (
          <p className="mt-4 text-sm">
            <Link
              href={`${routes.myDomains}/${encodeURIComponent(order.domain)}`}
              className="hb-link"
            >
              Manage domain
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
