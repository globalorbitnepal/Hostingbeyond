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
    <div className="min-h-dvh bg-[#F6F8FC] px-5 py-8 sm:px-8">
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
            You are signed in. Hosting services, invoices and domains for this
            account will appear here as they are provisioned.
          </p>
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
