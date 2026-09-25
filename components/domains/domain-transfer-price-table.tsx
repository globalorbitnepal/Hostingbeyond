"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { routes } from "@/config/routes";
import type { DomainTldRow } from "@/lib/domains/content";
import {
  TLD_CATEGORIES,
  formatPrice,
  type TldCategory,
} from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

type Filter = TldCategory | "all";

export function DomainTransferPriceTable({
  prices,
  footnote,
}: {
  prices: DomainTldRow[];
  footnote: string;
}) {
  const [filter, setFilter] = useState<Filter>("popular");
  const [term, setTerm] = useState("");

  const rows = useMemo(() => {
    const needle = term.trim().toLowerCase().replace(/^\./, "");
    return prices
      .filter((item) => {
        const inCategory =
          filter === "all" || item.categories.includes(filter as TldCategory);
        const matches = !needle || item.tld.slice(1).startsWith(needle);
        return inCategory && matches;
      })
      .sort((a, b) => a.transfer - b.transfer);
  }, [filter, prices, term]);

  return (
    <div className="rounded-[28px] border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Extension categories"
          className="-mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1"
        >
          {TLD_CATEGORIES.map((category) => {
            const active = filter === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(category.id)}
                className={cn(
                  "shrink-0 snap-start rounded-full px-3.5 py-2 text-[12.5px] font-bold whitespace-nowrap transition",
                  active
                    ? "bg-[#673de6] text-white shadow-[0_10px_22px_-12px_rgba(103,61,230,0.9)]"
                    : "border border-slate-200 text-slate-600 hover:border-[#c7b8ff] hover:text-[#4c1d95]",
                )}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <label className="flex h-11 w-full shrink-0 items-center gap-2 rounded-full border border-slate-200 px-4 focus-within:border-[#673de6] lg:w-64">
          <Search className="size-4 text-slate-400" />
          <span className="sr-only">Filter extensions</span>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Filter extensions"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-[#1a1035] outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
              <th className="py-3 pr-4">Extension</th>
              <th className="py-3 pr-4">Transfer</th>
              <th className="py-3 pr-4">Renewal</th>
              <th className="py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.tld}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="py-3.5 pr-4 font-extrabold text-[#1e1b4b]">
                  {row.tld}
                </td>
                <td className="py-3.5 pr-4 font-bold text-[#673de6]">
                  {formatPrice(row.transfer)}
                </td>
                <td className="py-3.5 pr-4 text-slate-600">
                  {formatPrice(row.renew)}
                </td>
                <td className="py-3.5 text-right">
                  <Link
                    href={`${routes.domainTransfer}?domain=${encodeURIComponent(`yourname${row.tld}`)}#transfer-check`}
                    className="text-[13px] font-bold text-[#673de6] hover:underline"
                  >
                    Transfer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footnote ? (
        <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
