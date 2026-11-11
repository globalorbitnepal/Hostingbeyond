"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import type { NameSiloSslProduct } from "@/lib/panel/namesilo-ssl-catalog";
import type { SslInventoryRow } from "@/lib/panel/ssl-inventory";
import { formatDomainDate } from "@/lib/panel/domain-status";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function PanelSslManager({
  rows,
  products,
  livePrices,
  hasActiveHosting,
  flash,
}: {
  rows: SslInventoryRow[];
  products: NameSiloSslProduct[];
  livePrices: boolean;
  hasActiveHosting: boolean;
  flash: string | null;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState(rows[0]?.domain ?? "");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function renewFree(target: string) {
    setBusy(`free:${target}`);
    setError(null);
    try {
      const res = await fetch("/api/account/ssl/renew-free", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: target }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "Could not renew AutoSSL.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not renew AutoSSL.");
    } finally {
      setBusy(null);
    }
  }

  async function buy(event: FormEvent) {
    event.preventDefault();
    setBusy("buy");
    setError(null);
    try {
      const res = await fetch("/api/account/ssl/buy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain, productId }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        checkoutUrl?: string;
      } | null;
      if (!res.ok || !json?.checkoutUrl) {
        setError(json?.error ?? "Could not start SSL checkout.");
        return;
      }
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Could not start SSL checkout.");
      setBusy(null);
    }
  }

  const selected = products.find((row) => row.id === productId);

  return (
    <div className="space-y-5">
      {flash ? (
        <p className="hb-panel-card px-4 py-3 text-sm">{flash}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="hb-panel-card overflow-hidden p-0">
        <div className="border-b px-5 py-4">
          <h2 className="hb-h2">Certificates on your domains</h2>
          <p className="hb-muted mt-1 text-xs">
            Free AutoSSL is included with active hosting. Premium SSL is billed
            at the NameSilo store price — no markup in this panel.
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="hb-muted px-5 py-8 text-sm">
            Register a domain to see SSL renewal dates.
          </p>
        ) : (
          <ul>
            {rows.map((row) => (
              <li
                key={row.domain}
                className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="hb-text truncate text-sm font-bold">
                    {row.domain}
                  </p>
                  <p className="hb-muted text-xs">
                    {row.productName} · {row.status}
                    {row.expiresAt
                      ? ` · renews ${formatDomainDate(row.expiresAt)}`
                      : ""}
                  </p>
                </div>
                {row.kind === "FREE" ? (
                  <button
                    type="button"
                    className="hb-btn hb-btn-ghost hb-btn-sm"
                    disabled={
                      !row.canRenewFree || busy === `free:${row.domain}`
                    }
                    onClick={() => void renewFree(row.domain)}
                  >
                    {busy === `free:${row.domain}`
                      ? "Renewing…"
                      : "Renew free SSL"}
                  </button>
                ) : (
                  <span className="hb-pill-ok px-2 py-1 text-[11px] font-bold">
                    Premium
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {!hasActiveHosting ? (
          <p className="hb-muted border-t px-5 py-3 text-xs">
            Free renew needs an Active hosting plan so Let’s Encrypt can
            reissue.
          </p>
        ) : null}
      </section>

      <section className="hb-panel-card p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="hb-h2">Buy premium SSL</h2>
            <p className="hb-muted mt-1 text-xs">
              Prices from NameSilo
              {livePrices ? " (live store)" : " (last verified catalog)"}.
              Charged exactly as shown.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setProductId(product.id)}
              className={`hb-soft px-3 py-3 text-left ring-2 ${
                productId === product.id
                  ? "ring-[var(--hb-p-primary)]"
                  : "ring-transparent"
              }`}
            >
              <p className="hb-text text-sm font-bold">{product.name}</p>
              <p className="mt-1 text-lg font-black">
                {money(product.priceUsd)}
              </p>
              <p className="hb-muted text-[11px]">{product.termLabel}</p>
            </button>
          ))}
        </div>
        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={buy}>
          <label className="text-xs font-semibold">
            Domain
            <select
              className="hb-input mt-1"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              required
            >
              {rows.map((row) => (
                <option key={row.domain} value={row.domain}>
                  {row.domain}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="hb-btn hb-btn-primary"
            disabled={busy === "buy" || rows.length === 0 || !selected}
          >
            {busy === "buy"
              ? "Opening checkout…"
              : selected
                ? `Pay ${money(selected.priceUsd)}`
                : "Select a product"}
          </button>
        </form>
      </section>
    </div>
  );
}
