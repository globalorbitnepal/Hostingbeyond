"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Search,
  Wallet,
} from "lucide-react";

import { CatalogPrice } from "@/components/i18n/localized-text";
import { PanelTldSalePrice } from "@/components/panel/panel-tld-sale-price";
import { routes } from "@/config/routes";
import type { TransferCheckResult } from "@/lib/domains/transfer";
import type { LiveDomainTld } from "@/lib/panel/featured-domain-tld-types";
import { formatMoney } from "@/lib/panel/format-money";
import { cn } from "@/lib/utils";

type WalletSnapshot = { balance: number; currency: string };

const STEPS = [
  {
    icon: Lock,
    title: "Unlock the domain",
    body: "Turn off transfer lock at your current registrar. Keep nameservers as they are — your site and email stay online.",
  },
  {
    icon: CalendarClock,
    title: "Pass the 60-day rule",
    body: "ICANN blocks transfers for 60 days after registration or a previous transfer. Wait that window out before you start.",
  },
  {
    icon: KeyRound,
    title: "Get the auth / EPP code",
    body: "Copy the authorization code from the current registrar. We never put it in the URL and we only send it to the registry.",
  },
  {
    icon: Mail,
    title: "Approve the email",
    body: "Most registries email the registrant to confirm. Approve that message so NameSilo can finish the move.",
  },
] as const;

export function PanelDomainTransfer({
  featuredTlds,
}: {
  featuredTlds: LiveDomainTld[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [domain, setDomain] = useState(
    params.get("domain") ?? params.get("q") ?? "",
  );
  const [tld, setTld] = useState(featuredTlds[0]?.tld ?? ".com");
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TransferCheckResult | null>(null);
  const [authCode, setAuthCode] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const com = featuredTlds.find((row) => row.tld === ".com") ?? featuredTlds[0];
  const due = result?.transferPrice ?? null;
  const funded = due != null && wallet != null ? wallet.balance >= due : false;

  const loadWallet = useCallback(async () => {
    const res = await fetch("/api/domains/wallet", { cache: "no-store" });
    const data = (await res.json()) as WalletSnapshot & { error?: string };
    if (!res.ok) throw new Error(data.error || "Wallet is unavailable.");
    setWallet({ balance: data.balance, currency: data.currency || "USD" });
  }, []);

  async function runCheck(name: string) {
    setBusy(true);
    setError("");
    setNotice("");
    setResult(null);
    setStatus(null);
    setPublicId(null);
    setConfirmed(false);
    try {
      const res = await fetch("/api/domains/transfer-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: name }),
      });
      const data = (await res.json()) as {
        error?: string;
        result?: TransferCheckResult;
      };
      if (!res.ok || !data.result) {
        setError(data.error || "This domain cannot be transferred right now.");
        return;
      }
      setResult(data.result);
      if (data.result.eligible) {
        await loadWallet().catch(() => setWallet(null));
      } else {
        setError(data.result.message);
      }
    } catch {
      setError("Transfer check could not reach the registrar API.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const raw = domain.trim().toLowerCase();
    if (!raw) {
      setError("Type the domain you want to transfer.");
      return;
    }
    void runCheck(raw);
  }

  function chooseTld(next: string) {
    setTld(next);
    const raw = domain.trim();
    const name = raw ? raw.split(".")[0] : "yourbrand";
    setDomain(`${name}${next}`);
  }

  async function payTransfer() {
    if (!result?.domain || paying) return;
    const code = authCode.trim();
    if (code.length < 4) {
      setError("Enter the auth / EPP code from your current registrar.");
      return;
    }
    if (!confirmed) {
      setError(
        "Confirm you unlocked the domain and reviewed the transfer price.",
      );
      return;
    }
    setPaying(true);
    setError("");
    setNotice("");
    try {
      await loadWallet();
      const res = await fetch("/api/domains/checkout/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key":
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `trf-${Date.now()}`,
        },
        body: JSON.stringify({
          domain: result.domain,
          authCode: code,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        reconciliation?: boolean;
        transfer?: { publicId?: string; status?: string; domain?: string };
      };
      if (res.status === 402) {
        setError(
          data.error ||
            "Wallet balance is too low. Top up, then transfer again.",
        );
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.error || "Transfer could not be started.");
        return;
      }
      setAuthCode("");
      setPublicId(data.transfer?.publicId ?? null);
      setStatus(data.transfer?.status ?? "SUBMITTED");
      setNotice(
        data.reconciliation
          ? "Transfer submitted. We are confirming it with the registry."
          : "Transfer started. Approve the registrar email if you receive one.",
      );
      router.refresh();
    } catch {
      setError("Transfer could not reach the registrar API.");
    } finally {
      setPaying(false);
    }
  }

  useEffect(() => {
    if (!publicId || status === "COMPLETED" || status === "FAILED") return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(
          `/api/domains/checkout/transfer?publicId=${encodeURIComponent(publicId)}`,
        );
        const data = (await res.json()) as {
          transfer?: { status?: string };
        };
        if (data.transfer?.status) setStatus(data.transfer.status);
      } catch {
        /* ignore poll errors */
      }
    }, 12_000);
    return () => window.clearInterval(timer);
  }, [publicId, status]);

  const caption = useMemo(() => {
    if (!com || com.transfer == null) return null;
    return com;
  }, [com]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="hb-ds-hero">
        <h1 className="font-heading text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Transfer your domain to HostingBeyond
        </h1>
        <p className="hb-ds-hero__lead">
          Keep the website and email you already have. We check the live
          registry, charge your wallet the Orbit transfer rate, and submit the
          move to NameSilo.
        </p>
        <form className="hb-ds-search" onSubmit={onSubmit}>
          <Search className="h-4 w-4 shrink-0 text-[var(--hb-p-muted)]" />
          <input
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="Type the domain you want to transfer"
            aria-label="Domain to transfer"
            autoComplete="off"
          />
          <button type="submit" disabled={busy} aria-label="Check transfer">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </form>
        {caption?.transfer != null ? (
          <p className="hb-ds-xfer-note">
            Transfer your {caption.tld} for{" "}
            <CatalogPrice usd={caption.transfer} />. The price includes one year
            at the registry — then it renews at{" "}
            <CatalogPrice usd={caption.renew} />.
          </p>
        ) : null}
        <div className="hb-ds-tlds">
          {featuredTlds.map((item) => (
            <button
              key={item.tld}
              type="button"
              className="hb-ds-tld"
              data-active={tld === item.tld ? "true" : "false"}
              onClick={() => chooseTld(item.tld)}
            >
              {item.transfer != null && item.transfer < item.renew ? (
                <span className="hb-ds-sale-badge">SALE</span>
              ) : null}
              <span className="text-sm font-bold">{item.tld}</span>
              {item.transfer != null ? (
                <PanelTldSalePrice
                  register={item.transfer}
                  renew={item.renew}
                />
              ) : (
                <span className="text-sm text-[var(--hb-p-muted)]">—</span>
              )}
              <span className="hb-ds-tld__hint">transfer · 1 yr included</span>
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
          {notice}
          {status ? ` · ${status}` : ""}
          {publicId ? (
            <>
              {" "}
              <Link href={routes.myDomains} className="font-semibold underline">
                Open portfolio
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {result && result.requirements?.length ? (
        <section className="hb-panel-card space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--hb-p-muted)] uppercase">
                Live registrar check
              </p>
              <h2 className="font-heading mt-1 text-xl font-bold">
                {result.domain}
              </h2>
              <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
                {result.currentRegistrar
                  ? `Currently at ${result.currentRegistrar}`
                  : "Verified with the registry"}
                {result.currentExpiresOn
                  ? ` · expires ${result.currentExpiresOn}`
                  : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-extrabold">
                <CatalogPrice usd={result.transferPrice ?? 0} />
              </p>
              <span
                className={cn(
                  "mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                  result.eligible
                    ? "bg-[var(--hb-p-ok-bg)] text-[var(--hb-p-ok)]"
                    : "bg-[var(--hb-p-warn-bg)] text-[var(--hb-p-warn)]",
                )}
              >
                {result.eligible ? "Ready to transfer" : "Requirements not met"}
              </span>
            </div>
          </div>

          <ul className="space-y-2">
            {result.requirements.map((req) => (
              <li key={req.id} className="flex items-start gap-3">
                {req.state === "pass" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hb-p-ok)]" />
                ) : req.state === "fail" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hb-p-danger)]" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hb-p-warn)]" />
                )}
                <span className="min-w-0 text-sm">
                  <span className="font-semibold">{req.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--hb-p-muted)]">
                    {req.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {result.expectedExpiresOn ? (
            <p className="rounded-2xl bg-[var(--hb-p-primary)]/6 px-4 py-3 text-xs text-[var(--hb-p-muted)]">
              The price includes one year at the registry. After a successful
              transfer your domain expires on{" "}
              <strong className="hb-text">{result.expectedExpiresOn}</strong>.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="hb-btn hb-btn-ghost hb-btn-sm"
              disabled={busy}
              onClick={() => void runCheck(result.domain)}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Check again
            </button>
            <Link
              href={`https://www.whois.com/whois/${encodeURIComponent(result.domain)}`}
              target="_blank"
              rel="noreferrer"
              className="hb-btn hb-btn-ghost hb-btn-sm"
            >
              Public WHOIS
            </Link>
          </div>
        </section>
      ) : null}

      {result?.eligible && due != null ? (
        <section className="hb-panel-card space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--hb-p-muted)] uppercase">
                Step 2 · Pay and submit
              </p>
              <h2 className="font-heading mt-1 text-xl font-bold">
                Transfer {result.domain}
              </h2>
              <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
                {result.message}
              </p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-[var(--hb-p-ok)]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--hb-p-primary)]/8 px-4 py-3">
              <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--hb-p-muted)] uppercase">
                Transfer due today
              </p>
              <p className="font-heading mt-1 text-2xl font-extrabold">
                <CatalogPrice usd={due} />
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--hb-p-border)] px-4 py-3">
              <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--hb-p-muted)] uppercase">
                Then renews
              </p>
              <p className="mt-1 text-lg font-bold">
                {result.renewPrice != null ? (
                  <CatalogPrice usd={result.renewPrice} />
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--hb-p-border)] px-4 py-3">
              <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--hb-p-muted)] uppercase">
                Wallet
              </p>
              <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                <Wallet className="h-4 w-4 text-[var(--hb-p-primary)]" />
                {wallet ? formatMoney(wallet.balance, wallet.currency) : "—"}
              </p>
            </div>
          </div>

          <label className="block">
            <span className="hb-label">Auth / EPP code</span>
            <span className="relative mt-1 block">
              <input
                value={authCode}
                onChange={(event) => setAuthCode(event.target.value)}
                type={showAuth ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                className="hb-input h-11 pr-12"
                placeholder="Paste the code from your current registrar"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--hb-p-muted)]"
                onClick={() => setShowAuth((open) => !open)}
                aria-label={showAuth ? "Hide auth code" : "Show auth code"}
              >
                {showAuth ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-[var(--hb-p-border)] p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <span className="text-sm">
              Domain is unlocked, older than 60 days, and I agree to pay the
              Orbit transfer price from my wallet.
            </span>
          </label>

          {!funded && wallet && due != null ? (
            <p className="text-sm text-[var(--hb-p-warn)]">
              Add funds to transfer this domain.{" "}
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
              onClick={() => void payTransfer()}
            >
              {paying ? "Submitting…" : "Pay with wallet and transfer"}
            </button>
            <Link href={routes.accountWallet} className="hb-btn hb-btn-ghost">
              Wallet
            </Link>
          </div>
        </section>
      ) : null}

      {result && !result.eligible && result.status === "available" ? (
        <section className="hb-panel-card space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[var(--hb-p-primary)]" />
            <h2 className="font-heading text-lg font-bold">
              {result.domain} is available to register
            </h2>
          </div>
          <p className="text-sm text-[var(--hb-p-muted)]">{result.message}</p>
          <Link
            href={`${routes.accountDomainFind}?q=${encodeURIComponent(result.domain)}`}
            className="hb-btn hb-btn-primary"
          >
            Register instead
          </Link>
        </section>
      ) : null}

      <section>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">
          Get your domain ready for transfer
        </h2>
        <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
          Follow these four checks before you pay. The registry will reject the
          move if any of them fail.
        </p>
        <div className="hb-ds-xfer-steps">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="hb-ds-xfer-step">
                <span className="hb-ds-xfer-step__n">{index + 1}</span>
                <span className="mb-3 grid size-10 place-items-center rounded-2xl bg-[#ede9fe] text-[#6d28d9]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--hb-p-muted)]">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
