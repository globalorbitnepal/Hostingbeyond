"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ShoppingCart, X } from "lucide-react";

import { useDomainCart } from "@/components/domains/domain-cart-provider";
import { routes } from "@/config/routes";
import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

export function DomainCartDrawer() {
  const {
    cart,
    drawerOpen,
    closeDrawer,
    removeDomain,
    checkoutHref,
    isAuthenticated,
  } = useDomainCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.setTimeout(() => closeRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (!drawerOpen) return null;

  const countLabel = cart.count === 1 ? "1 domain" : `${cart.count} domains`;

  return (
    <div className="fixed inset-0 z-[220] flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[#0f0a28]/45 backdrop-blur-[2px] transition-opacity"
        aria-label="Close cart"
        onClick={closeDrawer}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hb-domain-cart-title"
        aria-describedby="hb-domain-cart-subtitle"
        className={cn(
          "relative flex h-full w-full flex-col bg-white shadow-[0_0_60px_-12px_rgba(47,28,106,0.45)] transition-transform duration-200 ease-out",
          "max-sm:max-h-[92dvh] max-sm:self-end max-sm:rounded-t-[28px]",
          "sm:max-w-[min(100%,28rem)]",
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p
              id="hb-domain-cart-title"
              className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-[#1a1035]"
            >
              <ShoppingCart className="size-5 text-[#673de6]" aria-hidden />
              Domains cart
            </p>
            <p
              id="hb-domain-cart-subtitle"
              className="mt-0.5 text-[13px] font-medium text-slate-500"
            >
              {cart.count > 0 ? countLabel : "No domains in your cart"}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Close domains cart"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {cart.count === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
              <p className="text-[14px] font-semibold text-slate-700">
                Your cart is empty.
              </p>
              <p className="mt-1 text-[13px] text-slate-500">
                Search for a domain and add it here.
              </p>
              <Link
                href={routes.domainSearch}
                onClick={closeDrawer}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#673de6] px-6 text-[13px] font-bold text-white"
              >
                Search domains
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.items.map((line) => (
                <li
                  key={line.domain}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-22px_rgba(47,28,106,0.35)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className="text-[15px] font-extrabold tracking-tight break-words text-[#1a1035]"
                        style={{ overflowWrap: "anywhere" }}
                      >
                        {line.domain}
                      </p>
                      <p className="mt-0.5 text-[11px] font-bold text-[#673de6]/90">
                        Domain registration
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-slate-500">
                        {line.periodYears ?? 1} year
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeDomain(line.domain)}
                      className="shrink-0 text-[12px] font-bold text-slate-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                    <p className="text-[18px] font-extrabold text-[#1a1035]">
                      {formatPrice(line.register)}
                      <span className="text-[12px] font-bold text-slate-500">
                        {" "}
                        / 1st year
                      </span>
                    </p>
                    <p className="text-[11.5px] font-semibold text-slate-500">
                      Renews at {formatPrice(line.renew)}/yr
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.count > 0 ? (
          <footer className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Domains subtotal</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes / fees</span>
                <span>At checkout</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-[15px] font-extrabold text-[#1a1035]">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
            {!isAuthenticated ? (
              <p className="mt-2 text-[11.5px] leading-snug text-slate-500">
                Sign in to save your cart and complete registration. Prices are
                confirmed again at checkout.
              </p>
            ) : null}
            <Link
              href={checkoutHref}
              onClick={closeDrawer}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-[14px] font-bold text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.85)]"
            >
              Continue to checkout
            </Link>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Link
                href={routes.domainCart}
                onClick={closeDrawer}
                className="text-center text-[13px] font-semibold text-[#673de6] hover:underline"
              >
                View full cart
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-center text-[13px] font-semibold text-slate-500 hover:text-[#673de6]"
              >
                Continue shopping
              </button>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
