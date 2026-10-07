"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DomainPremiumCheckout } from "@/components/domains/domain-premium-checkout";
import type { DomainCheckoutOffersPayload } from "@/lib/domains/domain-checkout-offers";

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
  offers: DomainCheckoutOffersPayload;
  customerEmail: string;
  customerName: string | null;
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
  offers,
  customerEmail,
  customerName,
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
    <DomainPremiumCheckout
      lines={lines}
      walletBalance={balance}
      walletCurrency={walletCurrency}
      paymentProviderReady={paymentProviderReady}
      priceChanges={priceChanges}
      requiresPriceConfirmation={requiresPriceConfirmation}
      offers={offers}
      customerEmail={customerEmail}
      customerName={customerName}
      onRemoveLine={removeLine}
      onCompleteCheckout={completeCheckout}
      submitting={submitting}
      error={error}
      results={results}
      priceConfirmed={priceConfirmed}
      onConfirmPrices={() => {
        setPriceConfirmed(true);
        setError(null);
        router.refresh();
      }}
      rejectedNotice={rejectedNotice}
      insufficient={insufficient}
      allDone={allDone}
    />
  );
}
