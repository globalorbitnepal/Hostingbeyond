"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";
import { routes } from "@/config/routes";
import { formatPrice } from "@/lib/domains/tlds";

type Props = {
  domain: string;
  authCode: string;
  transferPrice: number;
  renewPrice: number;
  currency: string;
  walletBalance: number;
};

export function DomainTransferCheckoutView({
  domain,
  authCode,
  transferPrice,
  renewPrice,
  currency,
  walletBalance,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/domains/checkout/transfer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ domain, authCode }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        transfer?: { publicId: string; status: string };
        reconciliation?: boolean;
      };
      if (!res.ok || !json.ok) {
        setMessage(json.error ?? "Transfer could not be started.");
        return;
      }
      setStatus(json.transfer?.status ?? "SUBMITTED");
      if (json.reconciliation) {
        setMessage(
          "Your transfer was submitted and is being verified with the registry.",
        );
      } else {
        setMessage(
          "Transfer started. We will update status when the registry confirms completion.",
        );
      }
    } catch {
      setMessage("Transfer could not be started.");
    } finally {
      setSubmitting(false);
    }
  }

  const insufficient = walletBalance < transferPrice;

  return (
    <div className="hb-band-cream min-h-dvh px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link href="/">
          <BrandMark />
        </Link>
        <div className="mt-8 rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]">
          <h1 className="text-2xl font-semibold text-slate-950">
            Transfer {domain}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Transfer {formatPrice(transferPrice)} · renews at{" "}
            {formatPrice(renewPrice)}/yr
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Wallet: {currency} {walletBalance.toFixed(2)}
          </p>
          {insufficient && !message ? (
            <p className="mt-3 text-sm text-amber-800">
              Insufficient balance.{" "}
              <Link
                href={routes.accountWallet}
                className="font-semibold text-[#673de6]"
              >
                Add funds
              </Link>
            </p>
          ) : null}
          {!message ? (
            <button
              type="button"
              disabled={submitting || insufficient}
              onClick={() => void submit()}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#673de6] text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Start transfer"
              )}
            </button>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p>{message}</p>
              {status ? (
                <p className="mt-2">
                  Status: <strong>{status}</strong>
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
