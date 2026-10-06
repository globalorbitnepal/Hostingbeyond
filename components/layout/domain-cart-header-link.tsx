"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { routes } from "@/config/routes";
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
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/domains/cart", { cache: "no-store" });
      if (res.status === 401) {
        setCount(0);
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as { count?: number };
      if (typeof json.count === "number") setCount(json.count);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<DomainCartUpdatedDetail>).detail;
      if (detail && typeof detail.count === "number") {
        setCount(detail.count);
        return;
      }
      void refresh();
    };
    window.addEventListener(DOMAIN_CART_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(DOMAIN_CART_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const ariaLabel = count > 0 ? `Cart, ${count} items` : "Cart";

  return (
    <Link
      href={routes.domainCheckout}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white font-semibold text-slate-800 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50",
        compact ? "size-9 shrink-0" : "h-[38px] px-3 text-[13px]",
      )}
      aria-label={ariaLabel}
    >
      <ShoppingCart
        className="size-[18px] shrink-0 text-slate-700"
        strokeWidth={2}
        aria-hidden
      />
      {!compact ? (
        <span className="hidden text-slate-800 lg:inline">Cart</span>
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
    </Link>
  );
}
