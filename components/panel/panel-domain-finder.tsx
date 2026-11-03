"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe,
  Loader2,
  Search,
} from "lucide-react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

type Row = {
  domain: string;
  status: string;
  register: number | null;
  renew: number | null;
  message?: string;
};

const STATUS_COPY: Record<string, { label: string; pill: string }> = {
  available: { label: "Available", pill: "hb-pill-ok" },
  premium: { label: "Premium", pill: "hb-pill-info" },
  taken: { label: "Taken", pill: "hb-pill-neutral" },
  invalid: { label: "Invalid", pill: "hb-pill-danger" },
  unknown: { label: "Check failed", pill: "hb-pill-warn" },
};

export function PanelDomainFinder() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState("");

  const search = useCallback(async (value: string) => {
    const q = value.trim();
    if (!q) return;
    setBusy(true);
    setError("");
    setRows([]);
    try {
      const res = await fetch("/api/domains/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, scope: "primary" }),
      });
      const data = (await res.json()) as {
        error?: string;
        primary?: Row;
        results?: Row[];
      };
      if (!res.ok) {
        setError(data.error || "Search failed.");
        return;
      }
      const list = data.primary ? [data.primary] : (data.results ?? []);
      setRows(list.slice(0, 8));
    } catch {
      setError("Search failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (initial) void search(initial);
  }, [initial, search]);

  async function addToCart(domain: string) {
    setAdding(domain);
    setError("");
    try {
      const res = await fetch("/api/domains/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not add this domain.");
        return;
      }
      router.push(routes.domainCart);
    } catch {
      setError("Could not add this domain.");
    } finally {
      setAdding("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <section className="hb-panel-hero">
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/75 uppercase">
          Domains
        </p>
        <h1 className="font-heading mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Search for a domain name
        </h1>
        <p className="mt-1 max-w-xl text-sm text-white/85">
          Live registrar availability and pricing. Add a name to the cart, then
          pay from your wallet.
        </p>
        <form
          className="relative mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            void search(query);
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-violet-700" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="yourbrand.com"
            className="hb-panel-search"
            aria-label="Domain name"
          />
          <button
            type="submit"
            disabled={busy}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full bg-violet-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {busy ? "Searching" : "Search"}
          </button>
        </form>
      </section>

      {error ? (
        <p className="hb-pill hb-pill-warn inline-flex">
          <AlertTriangle className="size-3.5" />
          {error}
        </p>
      ) : null}

      {busy && rows.length === 0 ? (
        <div className="hb-panel-card hb-muted flex items-center gap-2 p-5 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Checking the registry…
        </div>
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-2">
          {rows.map((row) => {
            const meta = STATUS_COPY[row.status] ?? {
              label: row.status,
              pill: "hb-pill-neutral",
            };
            const canBuy =
              row.status === "available" || row.status === "premium";
            return (
              <li
                key={row.domain}
                className="hb-panel-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Globe
                      className="size-4 text-[var(--hb-p-primary)]"
                      aria-hidden
                    />
                    <p className="hb-text truncate font-bold">{row.domain}</p>
                    <span className={cn("hb-pill", meta.pill)}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="hb-muted mt-1 text-xs">
                    {row.register != null
                      ? `$${row.register.toFixed(2)} first year`
                      : (row.message ?? "Price unavailable")}
                    {row.renew != null
                      ? ` · renews at $${row.renew.toFixed(2)}`
                      : ""}
                  </p>
                </div>
                {canBuy ? (
                  <button
                    type="button"
                    onClick={() => void addToCart(row.domain)}
                    disabled={adding === row.domain}
                    className="hb-btn hb-btn-primary"
                  >
                    {adding === row.domain ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Add and checkout
                  </button>
                ) : (
                  <Link
                    href={routes.accountDomainTransfer}
                    className="hb-btn hb-btn-ghost"
                  >
                    Transfer it instead
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {!busy && rows.length === 0 && !error ? (
        <div className="hb-panel-card p-5">
          <h2 className="hb-h2">Need a name that is already registered?</h2>
          <p className="hb-muted mt-1 text-sm">
            You can transfer a domain in from another registrar and keep the
            same website and email.
          </p>
          <Link
            href={routes.accountDomainTransfer}
            className="hb-btn hb-btn-ghost mt-3"
          >
            Start a transfer
          </Link>
        </div>
      ) : null}
    </div>
  );
}
