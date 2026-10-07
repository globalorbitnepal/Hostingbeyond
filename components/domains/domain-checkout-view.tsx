"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Wallet } from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";
import { routes } from "@/config/routes";
import { formatPrice } from "@/lib/domains/tlds";

export type DomainCheckoutLine = {
  domain: string;
  status: string;
  register: number;
  renew: number;
  currency: string;
};

export type DomainCheckoutResult =
  | {
      domain: string;
      state: "success";
      message: string;
      customerStatus: string;
    }
  | {
      domain: string;
      state: "failed";
      message: string;
    }
  | {
      domain: string;
      state: "reconciliation";
      message: string;
    };

type Props = {
  lines: DomainCheckoutLine[];
  walletBalance: number;
  walletCurrency: string;
  paymentProviderReady: boolean;
  cartRejected?: string[];
  priceChanges?: Array<{ domain: string; previous: number; current: number }>;
  requiresPriceConfirmation?: boolean;
};

function statusLabelForOrder(status: string): string {
  if (status === "REGISTERED") return "Active";
  if (status === "RECONCILIATION_REQUIRED") return "Verification in progress";
  if (status === "FAILED") return "Not completed";
  return "Processing";
}

export function DomainCheckoutView({
  lines: initialLines,
  walletBalance,
  walletCurrency,
  paymentProviderReady,
  cartRejected = [],
  priceChanges = [],
  requiresPriceConfirmation = false,
}: Props) {
  const router = useRouter();
  const [lines, setLines] = useState(initialLines);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DomainCheckoutResult[]>([]);
  const [balance, setBalance] = useState(walletBalance);
  const [priceConfirmed, setPriceConfirmed] = useState(
    !requiresPriceConfirmation,
  );
  const [rejectedNotice, setRejectedNotice] = useState(cartRejected);

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.register, 0),
    [lines],
  );

  const refreshWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/domains/wallet");
      const json = (await res.json()) as { balance?: number };
      if (typeof json.balance === "number") setBalance(json.balance);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  async function removeLine(domain: string) {
    if (submitting) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/domains/cart?domain=${encodeURIComponent(domain)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        setError("Could not remove that domain from your cart.");
        return;
      }
      setLines((prev) => prev.filter((line) => line.domain !== domain));
      setResults((prev) => prev.filter((item) => item.domain !== domain));
    } catch {
      setError("Could not remove that domain from your cart.");
    }
  }

  async function completeCheckout() {
    if (submitting || lines.length === 0 || !priceConfirmed) return;
    setSubmitting(true);
    setError(null);
    setResults([]);

    const revalidate = await fetch("/api/domains/cart", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "revalidate" }),
    });
    const revJson = (await revalidate.json()) as {
      cart?: { items: DomainCheckoutLine[] };
      priceChanges?: Array<{
        domain: string;
        previous: number;
        current: number;
      }>;
      rejected?: string[];
      requiresConfirmation?: boolean;
    };
    let checkoutLines = lines;
    if (revalidate.ok && revJson.cart?.items) {
      checkoutLines = revJson.cart.items.map((item) => ({
        domain: item.domain,
        status: item.status,
        register: Number(item.register),
        renew: Number(item.renew),
        currency: item.currency,
      }));
      setLines(checkoutLines);
      if (revJson.rejected?.length) {
        setRejectedNotice(revJson.rejected);
      }
      if (revJson.requiresConfirmation && revJson.priceChanges?.length) {
        setError(
          "Registration pricing was updated. Review the new prices and confirm before continuing.",
        );
        setPriceConfirmed(false);
        setSubmitting(false);
        return;
      }
      if (!revJson.cart.items.length) {
        setError("No domains in your cart are available to register anymore.");
        setSubmitting(false);
        return;
      }
    }

    const outcomes: DomainCheckoutResult[] = [];
    const succeeded: string[] = [];

    for (const line of checkoutLines) {
      const idempotencyKey = crypto.randomUUID();
      try {
        const res = await fetch("/api/domains/checkout/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": idempotencyKey,
          },
          body: JSON.stringify({ domain: line.domain }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          error?: string;
          reconciliation?: boolean;
          order?: { domain: string; status: string; message?: string };
        };

        if (!res.ok || !json.ok) {
          outcomes.push({
            domain: line.domain,
            state: "failed",
            message:
              json.error ||
              "Registration could not be completed. Please try again.",
          });
          continue;
        }

        if (
          json.reconciliation ||
          json.order?.status === "RECONCILIATION_REQUIRED"
        ) {
          outcomes.push({
            domain: line.domain,
            state: "reconciliation",
            message:
              "We're verifying your domain registration. Your payment has been safely held while we confirm the registration status.",
          });
          continue;
        }

        if (json.order?.status === "REGISTERED") {
          succeeded.push(line.domain);
          outcomes.push({
            domain: line.domain,
            state: "success",
            message: "Domain registration successful.",
            customerStatus: statusLabelForOrder(json.order.status),
          });
          continue;
        }

        outcomes.push({
          domain: line.domain,
          state: "failed",
          message:
            json.order?.message ||
            "Registration could not be completed. Please try again.",
        });
      } catch {
        outcomes.push({
          domain: line.domain,
          state: "failed",
          message: "Registration could not be completed. Please try again.",
        });
      }
    }

    setResults(outcomes);
    setSubmitting(false);
    if (succeeded.length) {
      for (const domain of succeeded) {
        await fetch(`/api/domains/cart?domain=${encodeURIComponent(domain)}`, {
          method: "DELETE",
        });
      }
    }
    await refreshWallet();
  }

  const allDone = results.length === lines.length && lines.length > 0;
  const insufficient = balance < total && !allDone;

  return (
    <div className="hb-band-cream min-h-dvh px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[78rem]">
        <Link href="/">
          <BrandMark />
        </Link>

        <div className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] sm:p-8">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Domain checkout
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Complete your registration
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Prices are confirmed on our servers before checkout. WHOIS privacy
            and DNS are included.
          </p>

          {rejectedNotice.length > 0 ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Removed from cart (no longer available):{" "}
              {rejectedNotice.join(", ")}
            </p>
          ) : null}

          {priceChanges.length > 0 && !priceConfirmed ? (
            <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950">
              <p className="font-semibold">Pricing updated</p>
              <ul className="mt-2 list-disc pl-5">
                {priceChanges.map((change) => (
                  <li key={change.domain}>
                    {change.domain}: {formatPrice(change.previous)} →{" "}
                    {formatPrice(change.current)}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-3 rounded-full bg-[#673de6] px-4 py-2 text-xs font-bold text-white"
                onClick={() => {
                  setPriceConfirmed(true);
                  setError(null);
                  router.refresh();
                }}
              >
                Confirm updated prices
              </button>
            </div>
          ) : null}

          <ul className="mt-6 space-y-3">
            {lines.map((line) => (
              <li
                key={line.domain}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {line.domain}
                  </p>
                  <p className="text-xs text-slate-500">
                    Renews at {formatPrice(line.renew)}/yr
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-[#673de6]">
                    {formatPrice(line.register)}/1st yr
                  </p>
                  {!submitting && results.length === 0 ? (
                    <button
                      type="button"
                      aria-label={`Remove ${line.domain} from cart`}
                      className="text-xs font-semibold text-slate-400 hover:text-red-600"
                      onClick={() => void removeLine(line.domain)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Wallet className="size-4 text-[#673de6]" />
              Wallet balance
            </span>
            <span className="text-sm font-bold text-slate-900">
              {walletCurrency} {balance.toFixed(2)}
            </span>
          </div>

          {insufficient ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Your wallet balance is too low for this order ({walletCurrency}{" "}
              {total.toFixed(2)} required).{" "}
              <Link
                href={routes.accountWallet}
                className="font-semibold text-[#673de6] underline"
              >
                Add funds
              </Link>
              {!paymentProviderReady ? (
                <span className="mt-1 block text-xs text-amber-800/80">
                  Card payments are not enabled yet — wallet top-up will
                  complete once billing is connected.
                </span>
              ) : null}
            </p>
          ) : null}

          {error ? (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {!allDone ? (
            <button
              type="button"
              disabled={
                submitting ||
                insufficient ||
                lines.length === 0 ||
                !priceConfirmed
              }
              onClick={() => void completeCheckout()}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6] text-sm font-bold text-white disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Register{" "}
              {lines.length === 1 ? "domain" : `${lines.length} domains`} ·{" "}
              {walletCurrency} {total.toFixed(2)}
            </button>
          ) : null}

          {results.length > 0 ? (
            <div className="mt-8 space-y-3">
              {results.map((item) => (
                <div
                  key={item.domain}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  {item.state === "success" ? (
                    <>
                      <p className="text-sm font-bold text-emerald-800">
                        {item.message}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        Domain: <strong>{item.domain}</strong>
                      </p>
                      <p className="text-sm text-slate-700">
                        Status: <strong>{item.customerStatus}</strong>
                      </p>
                    </>
                  ) : item.state === "reconciliation" ? (
                    <>
                      <p className="text-sm font-bold text-violet-900">
                        Verification in progress
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.message}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Domain: <strong>{item.domain}</strong>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-red-800">
                        Registration not completed
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.message}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Domain: <strong>{item.domain}</strong>
                      </p>
                    </>
                  )}
                </div>
              ))}
              <Link
                href={routes.account}
                className="mt-4 inline-flex h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-800"
              >
                Go to My Domains
              </Link>
            </div>
          ) : null}

          {!allDone ? (
            <button
              type="button"
              onClick={() => router.push(routes.domainSearch)}
              className="mt-4 text-sm font-semibold text-slate-500 hover:text-[#673de6]"
            >
              ← Back to domain search
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
