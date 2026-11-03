"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@/components/locale/locale-provider";
import { formatDomainDate } from "@/lib/panel/domain-status";

type WalletTx = {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  balanceAfter: number | null;
  note: string | null;
  createdAt: string;
};

type WalletPaymentRow = {
  publicId: string;
  amount: number;
  currency: string;
  status: string;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
};

export function WalletAccountPanel({
  initialBalance,
  currency,
  topUpStatus,
  paymentPublicId,
}: {
  initialBalance: number;
  currency: string;
  topUpStatus?: string | null;
  paymentPublicId?: string | null;
}) {
  const { checkoutNote } = useLocale();
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [payments, setPayments] = useState<WalletPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/domains/wallet/transactions");
      if (!res.ok) return;
      const json = (await res.json()) as {
        balance?: number;
        transactions?: WalletTx[];
        payments?: WalletPaymentRow[];
      };
      if (typeof json.balance === "number") setBalance(json.balance);
      if (Array.isArray(json.transactions)) setTransactions(json.transactions);
      if (Array.isArray(json.payments)) setPayments(json.payments);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 8000);
    return () => clearInterval(timer);
  }, []);

  const statusBanner = (() => {
    if (topUpStatus === "cancelled") {
      return "Payment was cancelled. Your wallet balance was not changed.";
    }
    if (topUpStatus === "processing") {
      return "Payment submitted — balance updates after Stripe verifies payment (usually within a minute).";
    }
    if (topUpStatus === "success") {
      return "Payment verified — your wallet balance has been updated.";
    }
    return null;
  })();

  return (
    <div className="mt-6 space-y-6">
      <p className="hb-text text-lg font-bold">
        Balance: {currency} {balance.toFixed(2)}
      </p>
      <p className="hb-muted text-sm">
        Wallet amounts are the USD ledger used for charges and credits.{" "}
        {checkoutNote}
      </p>
      {statusBanner ? (
        <p className="hb-pill hb-pill-info w-full justify-start text-sm">
          {statusBanner}
          {paymentPublicId ? (
            <span className="mt-1 block w-full text-xs">
              Reference: {paymentPublicId}
            </span>
          ) : null}
        </p>
      ) : null}

      <div>
        <h2 className="hb-text text-sm font-bold">Recent payments</h2>
        {loading && payments.length === 0 ? (
          <p className="hb-muted mt-2 text-sm">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="hb-muted mt-2 text-sm">No top-up payments yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {payments.slice(0, 8).map((p) => (
              <li
                key={p.publicId}
                className="hb-table-row flex justify-between px-3 py-2 text-sm"
              >
                <span>
                  {p.currency} {p.amount.toFixed(2)}{" "}
                  <span className="hb-muted">({p.status})</span>
                </span>
                <span className="hb-faint text-xs">
                  {formatDomainDate(p.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="hb-text text-sm font-bold">Transaction history</h2>
        {loading && transactions.length === 0 ? (
          <p className="hb-muted mt-2 text-sm">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="hb-muted mt-2 text-sm">No wallet activity yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {transactions.slice(0, 15).map((tx) => (
              <li key={tx.id} className="hb-table-row px-3 py-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="hb-text font-semibold">
                    {tx.type} · {tx.status}
                  </span>
                  <span>
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.currency} {Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
                {tx.note ? <p className="hb-muted text-xs">{tx.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
