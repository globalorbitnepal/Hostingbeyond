import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/auth/brand-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export default async function AccountPage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect("/login");

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
          <p className="mt-6 text-sm leading-6 text-slate-600">
            You are signed in. Your hosting services, domains, invoices, and
            support tickets will appear here as they are linked to this account.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "My Services",
                hint: "Plans, renewal dates, manage & upgrade",
              },
              { title: "My Domains", hint: "Registration, DNS, transfers" },
              {
                title: "Invoices & Payments",
                hint: "Billing history and receipts",
              },
              { title: "Support", hint: "Open tickets and get help" },
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
                  No items yet
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
