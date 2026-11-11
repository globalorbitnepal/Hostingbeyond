"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

import type { CustomerCard } from "@/lib/payments/customer-cards";

export function PanelPaymentCards({
  cards,
  configured,
  flash,
}: {
  cards: CustomerCard[];
  configured: boolean;
  flash: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addCard() {
    setBusy("add");
    setError(null);
    try {
      const res = await fetch("/api/account/billing/cards", { method: "POST" });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        checkoutUrl?: string;
      } | null;
      if (!res.ok || !json?.checkoutUrl) {
        setError(json?.error ?? "Could not start card setup.");
        return;
      }
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Could not start card setup.");
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/account/billing/cards", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentMethodId: id }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "Could not remove the card.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not remove the card.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {flash ? (
        <p className="hb-panel-card px-4 py-3 text-sm">{flash}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!configured ? (
        <p className="hb-muted text-sm">
          Card vault is not configured on this server. Wallet top-up still works
          when Stripe is enabled.
        </p>
      ) : null}
      <ul className="space-y-2">
        {cards.map((card) => (
          <li
            key={card.id}
            className="hb-soft flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[var(--hb-p-primary)]" />
              <div>
                <p className="hb-text text-sm font-bold capitalize">
                  {card.brand} ······{card.last4}
                  {card.isDefault ? " · Default" : ""}
                </p>
                <p className="hb-muted text-xs">
                  Expires {String(card.expMonth).padStart(2, "0")}/
                  {card.expYear}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="hb-btn hb-btn-ghost hb-btn-sm"
              disabled={busy === card.id}
              onClick={() => void remove(card.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {cards.length === 0 && configured ? (
        <p className="hb-muted text-sm">No cards saved yet.</p>
      ) : null}
      <button
        type="button"
        className="hb-btn hb-btn-primary"
        onClick={() => void addCard()}
        disabled={!configured || busy === "add"}
      >
        {busy === "add" ? "Opening secure form…" : "Add a card"}
      </button>
    </div>
  );
}
