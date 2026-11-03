"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  CalendarClock,
} from "lucide-react";

export function PanelDomainTransfer() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState("");
  const [price, setPrice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setReady("");
    setPrice(null);
    try {
      const res = await fetch("/api/domains/transfer-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = (await res.json()) as {
        error?: string;
        result?: {
          domain?: string;
          eligible?: boolean;
          message?: string;
          transferPrice?: number | null;
          checkoutHref?: string;
        };
      };
      if (!res.ok) {
        setError(data.error || "This domain cannot be transferred right now.");
        return;
      }
      if (!data.result?.eligible) {
        setError(
          data.result?.message ||
            "This domain cannot be transferred right now.",
        );
        return;
      }
      setPrice(
        data.result.transferPrice != null
          ? `$${data.result.transferPrice.toFixed(2)}`
          : null,
      );
      setReady(
        data.result.checkoutHref ||
          `/domain-transfer?domain=${encodeURIComponent(
            data.result.domain || domain,
          )}`,
      );
    } catch {
      setError("Transfer check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <section className="hb-panel-hero">
        <p className="text-[11px] font-bold tracking-[0.18em] text-white/75 uppercase">
          Domains
        </p>
        <h1 className="font-heading mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Transfer your domain to HostingBeyond
        </h1>
        <p className="mt-1 max-w-xl text-sm text-white/85">
          Keep your existing website and email. We check eligibility first; the
          auth code is collected only on the secure transfer checkout.
        </p>
      </section>

      <div className="hb-panel-card p-5 sm:p-6">
        <form onSubmit={(event) => void onSubmit(event)} className="space-y-3">
          <label className="block">
            <span className="hb-label">Domain to transfer</span>
            <input
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.com"
              className="hb-input h-11"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="hb-btn hb-btn-primary"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {busy ? "Checking" : "Check transfer"}
          </button>
        </form>

        {error ? (
          <p className="hb-pill hb-pill-warn mt-3 inline-flex">
            <AlertTriangle className="size-3.5" />
            {error}
          </p>
        ) : null}

        {ready ? (
          <div className="hb-soft mt-4 space-y-2 p-4">
            <p className="hb-text flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="size-4 text-[var(--hb-p-ok)]" />
              Ready to transfer
              {price ? (
                <span className="hb-muted">· {price} for one year</span>
              ) : null}
            </p>
            <p className="hb-muted text-xs">
              Continue to the secure checkout to enter the auth code and pay
              from your wallet.
            </p>
            <Link href={ready} className="hb-btn hb-btn-primary">
              Continue transfer
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : null}
      </div>

      <div className="hb-panel-card p-5">
        <h2 className="hb-h2">Get your domain ready</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: CalendarClock,
              title: "At least 60 days old",
              body: "Registries block transfers in the first 60 days after registration.",
            },
            {
              icon: Lock,
              title: "Transfer lock off",
              body: "Unlock the domain at your current registrar before starting.",
            },
            {
              icon: KeyRound,
              title: "Auth (EPP) code",
              body: "Your current registrar provides this code in their control panel.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="hb-soft p-3">
                <Icon
                  className="size-4 text-[var(--hb-p-primary)]"
                  aria-hidden
                />
                <p className="hb-text mt-2 text-sm font-bold">{item.title}</p>
                <p className="hb-muted mt-0.5 text-xs">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
