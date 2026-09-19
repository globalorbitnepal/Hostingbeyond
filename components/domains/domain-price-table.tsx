"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { routes } from "@/config/routes";
import {
  TLD_CATEGORIES,
  TLD_PRICES,
  formatPrice,
  type TldCategory,
} from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

type Filter = TldCategory | "all";

export function DomainPriceTable() {
  const [filter, setFilter] = useState<Filter>("popular");
  const [term, setTerm] = useState("");

  const rows = useMemo(() => {
    const needle = term.trim().toLowerCase().replace(/^\./, "");
    return TLD_PRICES.filter((item) => {
      const inCategory =
        filter === "all" || item.categories.includes(filter as TldCategory);
      const matches = !needle || item.tld.slice(1).startsWith(needle);
      return inCategory && matches;
    }).sort((a, b) => a.register - b.register);
  }, [filter, term]);

  return (
    <div className="rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_24px_60px_-34px_rgba(15,10,40,0.35)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Domain categories"
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

      <div className="mt-4 hidden grid-cols-[1fr_repeat(3,0.85fr)_auto] gap-4 border-b border-slate-200 px-4 pb-2 text-[11.5px] font-extrabold tracking-wide text-slate-500 uppercase lg:grid">
        <span>Extension</span>
        <span>First year</span>
        <span>Renewal</span>
        <span>Transfer</span>
        <span className="text-right">Register</span>
      </div>

      <ul className="mt-2 divide-y divide-slate-100">
        {rows.map((row) => (
          <li
            key={row.tld}
            className="grid grid-cols-2 items-center gap-3 px-1 py-4 sm:px-4 lg:grid-cols-[1fr_repeat(3,0.85fr)_auto] lg:gap-4"
          >
            <div className="col-span-2 lg:col-span-1">
              <p className="text-[17px] font-extrabold tracking-tight text-[#2f1c6a]">
                {row.tld}
              </p>
              {row.note ? (
                <p className="mt-0.5 text-[12px] text-slate-500">{row.note}</p>
              ) : null}
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase lg:hidden">
                First year
              </p>
              <p className="text-[16px] font-extrabold text-[#15803d]">
                {formatPrice(row.register)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase lg:hidden">
                Renewal
              </p>
              <p className="text-[14.5px] font-bold text-slate-700">
                {formatPrice(row.renew)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase lg:hidden">
                Transfer
              </p>
              <p className="text-[14.5px] font-bold text-slate-700">
                {formatPrice(row.transfer)}
              </p>
            </div>

            <div className="flex justify-end">
              <Link
                href={`${routes.getStarted}?tld=${encodeURIComponent(row.tld)}`}
                className="inline-flex h-10 items-center rounded-full border border-[#c7b8ff] bg-white px-4 text-[13px] font-bold text-[#4c1d95] transition hover:bg-[#f7f4ff]"
              >
                Register
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-[13.5px] text-slate-500">
          No extension matches “{term}”. Try another search.
        </p>
      ) : null}

      <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
        Prices are per year in USD and exclude local taxes. First-year pricing
        applies to new registrations; renewals use the standard rate shown
        above.
      </p>
    </div>
  );
}
