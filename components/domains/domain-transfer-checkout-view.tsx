"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/layout/header";
import { routes } from "@/config/routes";
import { CatalogPrice } from "@/components/i18n/localized-text";
import { useLocale } from "@/components/locale/locale-provider";

type Props = {
  domain: string;
  transferPrice: number;
  renewPrice: number;
  currency: string;
  walletBalance: number;
};

export function DomainTransferCheckoutView({
  domain,
  transferPrice,
  renewPrice,
  currency,
  walletBalance,
}: Props) {
  const { t } = useLocale();
  const [authCode, setAuthCode] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);

  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(
        `/api/domains/checkout/transfer?publicId=${encodeURIComponent(id)}`,
      );
      const json = (await res.json()) as {
        ok?: boolean;
        transfer?: { status: string };
      };
      if (json.ok && json.transfer?.status) {
        setStatus(json.transfer.status);
      }
    } catch {
      /* ignore poll errors */
    }
  }, []);

  useEffect(() => {
    if (!publicId || status === "COMPLETED" || status === "FAILED") return;
    const t = window.setInterval(() => void pollStatus(publicId), 12_000);
    return () => window.clearInterval(t);
  }, [publicId, pollStatus, status]);

  async function submit() {
    if (submitting) return;
    const code = authCode.trim();
    if (code.length < 4) {
      setMessage("Enter the auth (EPP) code from your current registrar.");
      return;
    }
    if (!confirmed) {
      setMessage("Confirm you reviewed the transfer price and terms.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/domains/checkout/transfer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ domain, authCode: code }),
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
      setPublicId(json.transfer?.publicId ?? null);
      setAuthCode("");
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
    <div className="hb-checkout-premium hb-checkout-premium--domain min-h-dvh overflow-x-hidden">
      <div className="hb-checkout-premium__ambient" aria-hidden />
      <div className="relative z-10">
        <SiteHeader />
      </div>
      <div className="relative z-10 mx-auto max-w-xl min-w-0 px-4 py-8 sm:px-8">
        <div className="mt-8 rounded-[28px] border border-white bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] sm:p-6">
          <h1 className="text-2xl font-semibold text-slate-950">
            Transfer {domain}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Transfer fee{" "}
            <strong>
              <CatalogPrice usd={transferPrice} />
            </strong>
            {renewPrice > 0 ? (
              <>
                {" "}
                · standard renewal <CatalogPrice usd={renewPrice} />
                /yr
              </>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            On most extensions, the transfer fee extends your registration by
            one year. Final total is charged from your wallet.{" "}
            {t.common.billedInUsd}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Wallet: {currency} {walletBalance.toFixed(2)}
          </p>

          {!message ? (
            <>
              <label
                htmlFor="transfer-checkout-auth"
                className="mt-5 block text-[12px] font-bold tracking-wide text-slate-500 uppercase"
              >
                Authorization (EPP) code
              </label>
              <div className="relative mt-2">
                <input
                  id="transfer-checkout-auth"
                  type={showAuth ? "text" : "password"}
                  autoComplete="off"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  translate="no"
                  className="notranslate w-full min-w-0 rounded-xl border border-slate-200 py-3 pr-12 pl-4 text-[14px] font-medium text-[#1a1035] outline-none focus:border-[#673de6] focus:ring-4 focus:ring-[#673de6]/10"
                />
                <button
                  type="button"
                  aria-label={showAuth ? "Hide auth code" : "Show auth code"}
                  className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  onClick={() => setShowAuth((v) => !v)}
                >
                  {showAuth ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 text-[13px] text-slate-600">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 size-4 rounded border-slate-300"
                />
                <span>
                  I unlocked the domain at my current registrar and confirm the
                  transfer fee of <CatalogPrice usd={transferPrice} />.
                </span>
              </label>

              {insufficient ? (
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

              <button
                type="button"
                disabled={submitting || insufficient}
                onClick={() => void submit()}
                className="mt-6 inline-flex h-12 min-h-[44px] w-full items-center justify-center rounded-full bg-[#673de6] text-sm font-bold text-white disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Confirm and start transfer ·{" "}
                    <CatalogPrice usd={transferPrice} />
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p>{message}</p>
              {status ? (
                <p className="mt-2" role="status">
                  Status: <strong>{status}</strong>
                </p>
              ) : null}
              <Link
                href={routes.myDomains}
                className="mt-3 inline-block font-semibold text-[#673de6]"
              >
                View my domains
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
