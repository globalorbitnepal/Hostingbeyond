"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { useDomainCartOptional } from "@/components/domains/domain-cart-provider";
import {
  DOMAIN_CART_UPDATED_EVENT,
  type DomainCartUpdatedDetail,
} from "@/lib/domains/domain-cart-events";
import { cn } from "@/lib/utils";

export function DomainCartHeaderLink({
  compact = false,
}: {
  compact?: boolean;
}) {
  const cartCtx = useDomainCartOptional();
  const [fallbackCount, setFallbackCount] = useState(0);

  const refreshFallback = useCallback(async () => {
    if (cartCtx) return;
    try {
      const res = await fetch("/api/domains/cart", { cache: "no-store" });
      if (res.status === 401) {
        const { guestCartSnapshot } =
          await import("@/lib/domains/guest-domain-cart");
        setFallbackCount(guestCartSnapshot().count);
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as { count?: number };
      if (typeof json.count === "number") setFallbackCount(json.count);
    } catch {
      /* ignore */
    }
  }, [cartCtx]);

  useEffect(() => {
    if (cartCtx) return;
    void refreshFallback();
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<DomainCartUpdatedDetail>).detail;
      if (detail && typeof detail.count === "number") {
        setFallbackCount(detail.count);
        return;
      }
      void refreshFallback();
    };
    window.addEventListener(DOMAIN_CART_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(DOMAIN_CART_UPDATED_EVENT, onUpdate);
  }, [cartCtx, refreshFallback]);

  const count = cartCtx?.cart.count ?? fallbackCount;
  const openDrawer = cartCtx?.openDrawer;

  const ariaLabel =
    count > 0
      ? `Domains cart, ${count === 1 ? "1 domain" : `${count} domains`}`
      : "Domains cart";

  return (
    <button
      type="button"
      onClick={() => openDrawer?.()}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white font-semibold text-slate-800 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50",
        compact ? "size-9 shrink-0" : "h-[38px] px-3 text-[13px]",
      )}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
    >
      <ShoppingCart
        className="size-[18px] shrink-0 text-slate-700"
        strokeWidth={2}
        aria-hidden
      />
      {!compact ? (
        <span className="hidden text-slate-800 lg:inline">Domains cart</span>
      ) : null}
      {count > 0 ? (
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-[#673de6] leading-none font-bold text-white",
            compact
              ? "absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]"
              : "lg:static lg:min-w-[1.25rem] lg:px-1.5 lg:py-0.5 lg:text-[11px]",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
