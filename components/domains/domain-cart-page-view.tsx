"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useDomainCart } from "@/components/domains/domain-cart-provider";
import { routes } from "@/config/routes";
import { formatPrice } from "@/lib/domains/tlds";

export function DomainCartPageView() {
  const { cart, removeDomain, checkoutHref, isAuthenticated } = useDomainCart();

  return (
    <div className="hb-band-cream min-h-dvh px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-[78rem]">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-[12px] font-semibold text-slate-500"
        >
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href={routes.home} className="hover:text-[#673de6]">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={routes.domainSearch} className="hover:text-[#673de6]">
                Domains
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-[#1a1035]">Domains cart</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_min(100%,22rem)] lg:items-start">
          <div>
            <h1 className="font-heading text-[clamp(1.65rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#1a1035]">
              Domains cart
              {cart.count > 0 ? (
                <span className="mt-1 block text-[15px] font-semibold text-slate-500">
                  {cart.count === 1 ? "1 domain" : `${cart.count} domains`}
                </span>
              ) : null}
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] text-slate-600">
              Review registration pricing before checkout. All totals are
              confirmed on our servers when you continue.
            </p>

            {cart.count === 0 ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                <ShoppingCart
                  className="mx-auto size-10 text-slate-300"
                  aria-hidden
                />
                <p className="mt-3 text-[15px] font-semibold text-slate-700">
                  Your cart is empty.
                </p>
                <p className="mt-1 text-[13px] text-slate-500">
                  Search for a domain and add it here.
                </p>
                <Link
                  href={routes.domainSearch}
                  className="mt-5 inline-flex h-12 items-center rounded-full bg-[#673de6] px-8 text-[14px] font-bold text-white"
                >
                  Search domains
                </Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {cart.items.map((line) => (
                  <li
                    key={line.domain}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p
                          className="text-[16px] font-extrabold break-words text-[#1a1035]"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {line.domain}
                        </p>
                        <p className="mt-0.5 text-[12px] font-semibold text-[#673de6]/90">
                          Domain registration
                        </p>
                        <p className="mt-1 text-[12.5px] text-slate-500">
                          {line.periodYears ?? 1} year ·{" "}
                          {formatPrice(line.register)} / first year · Renews{" "}
                          {formatPrice(line.renew)}/year
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-[18px] font-extrabold text-[#673de6]">
                          {formatPrice(line.register)}
                        </p>
                        <button
                          type="button"
                          onClick={() => void removeDomain(line.domain)}
                          className="text-[13px] font-bold text-slate-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(47,28,106,0.35)] lg:sticky lg:top-6"
            aria-label="Order summary"
          >
            <h2 className="text-[13px] font-bold tracking-wide text-slate-500 uppercase">
              Order summary
            </h2>
            <ul className="mt-4 space-y-2 border-b border-slate-100 pb-4">
              {cart.items.map((line) => (
                <li
                  key={line.domain}
                  className="flex justify-between gap-2 text-[13px]"
                >
                  <span
                    className="min-w-0 font-medium break-words text-slate-700"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {line.domain}
                  </span>
                  <span className="shrink-0 font-semibold text-slate-900">
                    {formatPrice(line.register)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 text-[13px]">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Domains subtotal</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes / fees</span>
                <span>At checkout</span>
              </div>
              <div className="flex justify-between pt-2 text-[16px] font-extrabold text-[#1a1035]">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
            {!isAuthenticated && cart.count > 0 ? (
              <p className="mt-3 text-[12px] leading-snug text-slate-500">
                You&apos;ll sign in before checkout. Guest cart items are merged
                into your account automatically.
              </p>
            ) : null}
            <Link
              href={checkoutHref}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-[14px] font-bold text-white disabled:pointer-events-none disabled:opacity-50"
              aria-disabled={cart.count === 0}
              tabIndex={cart.count === 0 ? -1 : 0}
            >
              Continue to checkout
            </Link>
            <Link
              href={routes.domainSearch}
              className="mt-3 block text-center text-[13px] font-semibold text-slate-500 hover:text-[#673de6]"
            >
              Continue searching domains
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
