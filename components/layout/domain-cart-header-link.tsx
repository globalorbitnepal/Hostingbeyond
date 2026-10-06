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

  const label = count > 0 ? `Cart (${count})` : "Cart";

  return (
    <Link
      href={routes.domainCheckout}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200/90 bg-white font-semibold text-slate-800 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50",
        compact ? "size-9 shrink-0" : "h-[38px] px-3 text-[13px] max-xl:px-2.5",
      )}
      aria-label={label}
    >
      <ShoppingCart className="size-4 text-slate-600" aria-hidden />
      {!compact ? <span className="hidden xl:inline">{label}</span> : null}
      {count > 0 ? (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-[#673de6] font-bold text-white",
            compact
              ? "-top-1 -right-1 size-4 text-[9px]"
              : "xl:static xl:ml-0.5 xl:inline-flex xl:size-auto xl:rounded-full xl:bg-[#ede9fe] xl:px-1.5 xl:py-0.5 xl:text-[11px] xl:text-[#4c1d95]",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
