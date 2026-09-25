"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Layers,
  Loader2,
  Search,
} from "lucide-react";

import { routes } from "@/config/routes";
import type { TransferCheckResult } from "@/lib/domains/transfer";
import { formatPrice } from "@/lib/domains/tlds";
import { cn } from "@/lib/utils";

const MODE_LINKS = [
  {
    id: "search",
    label: "Search a domain",
    href: routes.domainSearch,
    icon: Search,
  },
  {
    id: "bulk",
    label: "Bulk search",
    href: routes.bulkDomainSearch,
    icon: Layers,
  },
  {
    id: "transfer",
    label: "Transfer in",
    href: routes.domainTransfer,
    icon: ArrowLeftRight,
    current: true,
  },
] as const;

type Props = {
  searchPlaceholder: string;
  authPlaceholder: string;
  initialDomain?: string;
};

export function DomainTransferCheckPanel({
  searchPlaceholder,
  authPlaceholder,
  initialDomain = "",
}: Props) {
  const [domain, setDomain] = useState(initialDomain);
  const [authCode, setAuthCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TransferCheckResult | null>(null);

  const run = useCallback(async (name: string, code: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/domains/transfer-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: name, authCode: code }),
      });
      const json = (await response.json()) as {
        result?: TransferCheckResult;
        error?: string;
      };
      if (!response.ok || !json.result) {
        setResult(null);
        setError(json.error || "Could not check this domain. Try again.");
        return;
      }
      setResult(json.result);
    } catch {
      setResult(null);
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDomain.trim()) void run(initialDomain.trim(), "");
  }, [initialDomain, run]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!domain.trim()) {
      setError("Enter the domain you want to transfer.");
      return;
    }
    void run(domain.trim(), authCode);
  }

  return (
    <div
      id="transfer-check"
      className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_34px_80px_-34px_rgba(15,10,40,0.55)] ring-1 ring-black/[0.03] sm:rounded-[32px] sm:p-7"
    >
      <nav
        aria-label="Domain tools"
        className="flex w-full gap-1 overflow-x-auto rounded-full bg-[#f3f1ff] p-1"
      >
        {MODE_LINKS.map((tab) => {
          const Icon = tab.icon;
          const active = "current" in tab && tab.current;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 min-w-[120px] flex-1 items-center justify-center gap-2 rounded-full px-3 text-[12.5px] font-bold whitespace-nowrap transition sm:text-[13px]",
                active
                  ? "bg-white text-[#2f1c6a] shadow-[0_6px_16px_-8px_rgba(47,28,106,0.5)]"
                  : "text-slate-500 hover:text-[#2f1c6a]",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block">
          <span className="sr-only">Domain to transfer</span>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 focus-within:border-[#673de6] focus-within:ring-4 focus-within:ring-[#673de6]/10 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
              <ArrowLeftRight className="size-5 shrink-0 text-[#673de6]" />
              <input
                type="text"
                inputMode="url"
                autoComplete="off"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-[#1a1035] outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#673de6] px-6 text-[15px] font-bold text-white hover:bg-[#5c35d4] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <>
                  Check transfer
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-slate-500 uppercase">
            Authorization code
          </span>
          <input
            type="text"
            autoComplete="off"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            placeholder={authPlaceholder}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] font-medium text-[#1a1035] outline-none focus:border-[#673de6] focus:ring-4 focus:ring-[#673de6]/10"
          />
        </label>
      </form>

      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-800">
          {error}
        </p>
      ) : null}

      {result ? (
        <div
          className={cn(
            "mt-4 rounded-2xl border p-4 sm:p-5",
            result.eligible
              ? "border-emerald-200 bg-emerald-50/80"
              : result.status === "available"
                ? "border-amber-200 bg-amber-50/80"
                : "border-slate-200 bg-slate-50",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                {result.domain}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#1e1b4b]">
                {result.message}
              </p>
              {result.transferPrice != null && result.eligible ? (
                <p className="mt-2 text-[13px] font-bold text-[#673de6]">
                  Transfer {formatPrice(result.transferPrice)}/yr
                  {result.renewPrice != null
                    ? ` · renews at ${formatPrice(result.renewPrice)}/yr`
                    : null}
                </p>
              ) : null}
            </div>
            {result.eligible ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white uppercase">
                <BadgeCheck className="size-3.5" />
                Eligible
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.eligible ? (
              <Link
                href={result.checkoutHref}
                className="inline-flex h-11 items-center rounded-xl bg-[#673de6] px-5 text-[14px] font-bold text-white hover:bg-[#5c35d4]"
              >
                Continue to checkout
              </Link>
            ) : result.status === "available" ? (
              <Link
                href={result.checkoutHref}
                className="inline-flex h-11 items-center rounded-xl bg-[#1e1b4b] px-5 text-[14px] font-bold text-white hover:bg-[#2f1c6a]"
              >
                Register instead
              </Link>
            ) : (
              <Link
                href={routes.contact}
                className="inline-flex h-11 items-center rounded-xl border border-slate-300 bg-white px-5 text-[14px] font-bold text-[#1e1b4b]"
              >
                Contact support
              </Link>
            )}
            <Link
              href={routes.domainSearch}
              className="inline-flex h-11 items-center rounded-xl px-4 text-[14px] font-bold text-[#673de6] hover:underline"
            >
              Search another name
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
