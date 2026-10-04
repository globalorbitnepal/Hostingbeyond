import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/auth/brand-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import type { HostingOrderSnapshot } from "@/lib/hosting/cart/snapshot";
import { listHostingOrdersForUser } from "@/lib/hosting/hosting-orders";

function statusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Pending payment";
    case "DRAFT":
      return "Draft";
    case "PAID":
      return "Paid";
    case "PROVISIONING":
      return "Pending activation";
    case "ACTIVE":
      return "Active";
    case "CANCELLED":
      return "Cancelled";
    case "FAILED":
      return "Failed";
    case "EXPIRED":
      return "Expired";
    default:
      return status;
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect("/login");

  const params = await searchParams;
  const orders = await listHostingOrdersForUser(user.id);

  return (
    <div className="hb-band-cream min-h-dvh px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <BrandMark />
          </Link>
          <LogoutButton />
        </div>
        <div className="mt-10 rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] sm:p-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Client area
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Welcome{user.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{user.email}</p>

          {params.order ? (
            <p className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
              Order saved ({params.order}). Complete payment when billing is
              enabled — no charge has been made yet.
            </p>
          ) : null}

          <section className="mt-8">
            <h2 className="text-sm font-bold text-slate-900">Orders</h2>
            {orders.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No orders yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {orders.map((order) => {
                  const snap =
                    order.lineItemsSnapshot as HostingOrderSnapshot | null;
                  const title =
                    snap?.planName ?? `${order.productSlug} / ${order.planKey}`;
                  return (
                    <li
                      key={order.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {statusLabel(order.status)} · {order.billingCycle}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-[#673de6]">
                          {order.currency} {Number(order.total).toFixed(2)}
                        </p>
                      </div>
                      {snap ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Snapshot total locked at checkout configuration.
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "My Services",
                hint: "Hosting & VPS — manage, upgrade, renew",
              },
              { title: "My Domains", hint: "Registration, DNS, transfers" },
              {
                title: "Invoices & Payments",
                hint: "Billing history (Stripe phase)",
              },
              { title: "Support", hint: "Tickets and help" },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {card.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Coming in provisioning phase
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-5 text-sm font-semibold text-white"
          >
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
