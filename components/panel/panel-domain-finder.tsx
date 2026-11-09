"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe,
  Loader2,
  Percent,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { CatalogPrice } from "@/components/i18n/localized-text";
import { routes } from "@/config/routes";
import type { DomainResult } from "@/lib/domains/availability";
import { PanelTldCatalog } from "@/components/panel/panel-tld-catalog";
import { PanelTldSalePrice } from "@/components/panel/panel-tld-sale-price";
import type { LiveDomainTld } from "@/lib/panel/featured-domain-tld-types";
import { formatMoney } from "@/lib/panel/format-money";
import { cn } from "@/lib/utils";

type WalletSnapshot = { balance: number; currency: string };

type SearchPayload = {
  error?: string;
  primary?: DomainResult | null;
  recommendations?: DomainResult[];
  results?: DomainResult[];
  resultsCustomer?: DomainResult[];
};

function asResults(data: SearchPayload): DomainResult[] {
  const rows = data.resultsCustomer ??
    data.results ?? [
      ...(data.primary ? [data.primary] : []),
      ...(data.recommendations ?? []),
    ];
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row?.domain || seen.has(row.domain)) return false;
    seen.add(row.domain);
    return true;
  });
}

function statusTone(status: DomainResult["status"]) {
  if (status === "available") return "Available";
  if (status === "premium") return "Premium";
  if (status === "taken") return "Taken";
  return "Check";
}

export function PanelDomainFinder({
  featuredTlds,
  liveTlds,
}: {
  featuredTlds: LiveDomainTld[];
  liveTlds: LiveDomainTld[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [tld, setTld] = useState(featuredTlds[0]?.tld ?? ".com");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [selected, setSelected] = useState<DomainResult | null>(null);
  const [protect, setProtect] = useState(false);
  const [protectionPrice, setProtectionPrice] = useState<number | null>(null);
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [paying, setPaying] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/domains/checkout/offers", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          payload: {
            optional?: Array<{
              kind?: string;
              amount?: number;
              label?: string;
            }>;
          } | null,
        ) => {
          if (cancelled || !payload?.optional) return;
          const offer = payload.optional.find(
            (item) =>
              item.kind === "domain-protection" &&
              typeof item.amount === "number" &&
              item.amount > 0,
          );
          setProtectionPrice(offer?.amount ?? null);
        },
      )
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const due = useMemo(() => {
    if (!selected || selected.register == null) return 0;
    const extra = protect && protectionPrice != null ? protectionPrice : 0;
    return Math.round((selected.register + extra) * 100) / 100;
  }, [selected, protect, protectionPrice]);

  const funded = wallet != null && wallet.balance >= due;

  async function loadWallet() {
    const res = await fetch("/api/domains/wallet", { cache: "no-store" });
    const data = (await res.json()) as WalletSnapshot & { error?: string };
    if (!res.ok) throw new Error(data.error || "Wallet is unavailable.");
    setWallet({ balance: data.balance, currency: data.currency || "USD" });
  }

  async function runSearch(event?: FormEvent) {
    event?.preventDefault();
    const raw = query.trim().toLowerCase();
    if (!raw) {
      setError("Type a name to search.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setSelected(null);
    try {
      const res = await fetch("/api/domains/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: raw, scope: "fast" }),
      });
      const data = (await res.json()) as SearchPayload;
      if (!res.ok) {
        setResults([]);
        setError(data.error || "Search failed. Try another name.");
        return;
      }
      const rows = asResults(data);
      setResults(rows);
      const pick =
        rows.find((row) => row.status === "available") ?? rows[0] ?? null;
      setSelected(pick && pick.status === "available" ? pick : null);
      if (pick && pick.status === "available") {
        await loadWallet().catch(() => setWallet(null));
      }
      if (!rows.length) setError("No results for that name.");
    } catch {
      setError("Search could not reach the domain API.");
    } finally {
      setBusy(false);
    }
  }

  function chooseTld(next: string) {
    setTld(next);
    const raw = query.trim();
    if (!raw) return;
    const name = raw.split(".")[0];
    const nextQuery = `${name}${next}`;
    setQuery(nextQuery);
  }

  async function addToCart(domain: string) {
    setCartBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/domains/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not add that domain to your cart.");
        return;
      }
      setNotice(`${domain} is in your cart.`);
    } catch {
      setError("Could not add that domain to your cart.");
    } finally {
      setCartBusy(false);
    }
  }

  async function buyNow() {
    if (!selected?.domain) return;
    setPaying(true);
    setError("");
    setNotice("");
    try {
      await loadWallet();
      const res = await fetch("/api/domains/checkout/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: selected.domain,
          addDomainProtection: protect,
          idempotencyKey:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `reg-${Date.now()}`,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        order?: { domain?: string };
      };
      if (res.status === 402) {
        setError(
          data.error || "Wallet balance is too low. Top up, then buy again.",
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || "Registration could not be completed.");
        return;
      }
      const domain = data.order?.domain || selected.domain;
      router.push(`${routes.myDomains}/${encodeURIComponent(domain)}`);
      router.refresh();
    } catch {
      setError("Registration could not reach the domain API.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="hb-ds-hero">
        <h1 className="font-heading text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Search for a domain name
        </h1>
        <form className="hb-ds-search" onSubmit={runSearch}>
          <Search className="h-4 w-4 shrink-0 text-[var(--hb-p-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a domain or describe your idea"
            aria-label="Domain search"
            autoComplete="off"
          />
          <button type="submit" disabled={busy} aria-label="Search domains">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </form>
        <div className="hb-ds-tlds">
          {featuredTlds.map((item) => (
            <button
              key={item.tld}
              type="button"
              className="hb-ds-tld"
              data-active={tld === item.tld ? "true" : "false"}
              onClick={() => chooseTld(item.tld)}
            >
              {item.isPromo ? (
                <span className="hb-ds-sale-badge">SALE</span>
              ) : null}
              <span className="text-sm font-bold">{item.tld}</span>
              <PanelTldSalePrice register={item.register} renew={item.renew} />
              <span className="hb-ds-tld__hint">1st yr · then renewal</span>
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-[var(--hb-p-danger)]/30 bg-[var(--hb-p-danger-bg)] px-4 py-3 text-sm text-[var(--hb-p-danger)]">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-2xl border border-[var(--hb-p-ok)]/30 bg-[var(--hb-p-ok-bg)] px-4 py-3 text-sm text-[var(--hb-p-ok)]">
          {notice}{" "}
          <Link href={routes.domainCart} className="font-semibold underline">
            Open cart
          </Link>
        </p>
      ) : null}

      {results.length > 0 ? (
        <section className="hb-panel-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold">Choose a domain</h2>
            <p className="text-xs text-[var(--hb-p-muted)]">
              Live availability from the registrar API
            </p>
          </div>
          <ul className="space-y-2">
            {results.map((row) => {
              const available = row.status === "available";
              const active = selected?.domain === row.domain;
              return (
                <li
                  key={row.domain}
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3",
                    active
                      ? "border-[var(--hb-p-primary)] bg-[var(--hb-p-primary)]/6"
                      : "border-[var(--hb-p-border)]",
                  )}
                >
                  <Globe className="h-4 w-4 text-[var(--hb-p-primary)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{row.domain}</p>
                    <p className="text-xs text-[var(--hb-p-muted)]">
                      {statusTone(row.status)}
                      {row.message ? ` · ${row.message}` : ""}
                    </p>
                  </div>
                  {row.register != null ? (
                    <span className="text-right">
                      <PanelTldSalePrice
                        register={row.register}
                        renew={row.renew}
                        compact
                      />
                      <span className="mt-0.5 block text-[11px] font-medium text-[var(--hb-p-muted)]">
                        1st yr
                        {row.renew != null ? " · renews after" : ""}
                      </span>
                    </span>
                  ) : null}
                  {available ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="hb-btn hb-btn-ghost hb-btn-sm"
                        disabled={cartBusy}
                        onClick={() => void addToCart(row.domain)}
                      >
                        Add to cart
                      </button>
                      <button
                        type="button"
                        className="hb-btn hb-btn-primary hb-btn-sm"
                        onClick={() => {
                          setSelected(row);
                          void loadWallet().catch(() => setWallet(null));
                        }}
                      >
                        Buy
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-[var(--hb-p-muted)]">
                      Not for sale
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {selected && selected.status === "available" ? (
        <section className="hb-panel-card space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--hb-p-muted)] uppercase">
                Step 2 · Checkout
              </p>
              <h2 className="font-heading mt-1 text-xl font-bold">
                Register {selected.domain}
              </h2>
              <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
                WHOIS privacy is included free. Pay from your HostingBeyond
                wallet.
              </p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-[var(--hb-p-ok)]" />
          </div>

          {protectionPrice != null ? (
            <label className="flex items-start gap-3 rounded-2xl border border-[var(--hb-p-border)] p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={protect}
                onChange={(event) => setProtect(event.target.checked)}
              />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-[var(--hb-p-primary)]" />
                  Domain Protection
                </span>
                <span className="mt-1 block text-sm text-[var(--hb-p-muted)]">
                  Extra protection service for one year —{" "}
                  <CatalogPrice usd={protectionPrice} />
                </span>
              </span>
            </label>
          ) : (
            <p className="flex items-center gap-2 rounded-2xl bg-[var(--hb-p-primary)]/6 px-4 py-3 text-sm">
              <ShieldCheck className="h-4 w-4 text-[var(--hb-p-primary)]" />
              WHOIS privacy and DNS are included free with this domain.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--hb-p-primary)]/6 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4 text-[var(--hb-p-primary)]" />
              <span>
                Wallet{" "}
                {wallet ? formatMoney(wallet.balance, wallet.currency) : "—"}
              </span>
            </div>
            <p className="text-lg font-extrabold">
              Due today <CatalogPrice usd={due} />
            </p>
          </div>

          {!funded && wallet ? (
            <p className="text-sm text-[var(--hb-p-warn)]">
              Add funds to buy this domain.{" "}
              <Link
                href={routes.accountWallet}
                className="font-semibold underline"
              >
                Top up wallet
              </Link>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="hb-btn hb-btn-primary"
              disabled={paying || (wallet != null && !funded)}
              onClick={() => void buyNow()}
            >
              {paying ? "Registering…" : "Pay with wallet"}
            </button>
            <Link href={routes.accountWallet} className="hb-btn hb-btn-ghost">
              Wallet
            </Link>
            <button
              type="button"
              className="hb-btn hb-btn-ghost"
              disabled={cartBusy}
              onClick={() => void addToCart(selected.domain)}
            >
              Add to cart instead
            </button>
          </div>
        </section>
      ) : null}

      <div className="hb-ds-promo">
        <Link
          href={routes.accountHosting}
          className="hb-ds-promo-card"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
          }}
        >
          <span className="mb-4 grid size-10 place-items-center rounded-2xl bg-[#d9f99d] text-[#365314]">
            <Percent className="h-5 w-5" />
          </span>
          <h3 className="font-heading text-2xl font-extrabold">
            Get 1 month of free Unlimited hosting with your domain
          </h3>
          <p className="mt-3 text-sm text-white/80">
            Register a domain for 2+ years, then turn it into a website in
            minutes.
          </p>
        </Link>
        <div
          className="hb-ds-promo-card"
          style={{
            background:
              "linear-gradient(160deg, rgba(37,99,235,.35), rgba(124,58,237,.55)), #1d4ed8",
          }}
        >
          <p className="font-heading text-3xl font-black">9M+</p>
          <p className="text-sm text-white/85">domains registered</p>
          <p className="font-heading mt-6 text-3xl font-black">
            {liveTlds.length}+
          </p>
          <p className="text-sm text-white/85">live domain extensions</p>
        </div>
        <Link
          href={routes.accountDomainTransfer}
          className="hb-ds-promo-card"
          style={{
            background: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
          }}
        >
          <span className="mb-8 grid size-10 place-items-center rounded-2xl bg-white/15">
            <ArrowUpRight className="h-5 w-5" />
          </span>
          <h3 className="font-heading text-2xl font-extrabold">
            Domain transfer
          </h3>
          <p className="mt-2 text-sm text-white/80">
            Bring your domain over easily — .com from the live transfer price.
          </p>
        </Link>
      </div>

      <PanelTldCatalog
        liveTlds={liveTlds}
        previewLimit={12}
        onPickTld={chooseTld}
        heading="All live domain extensions"
      />
    </div>
  );
}
