"use client";

import { useEffect, useState } from "react";

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
      <p className="text-lg font-bold text-slate-900">
        Balance: {currency} {balance.toFixed(2)}
      </p>
      {statusBanner ? (
        <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900">
          {statusBanner}
          {paymentPublicId ? (
            <span className="mt-1 block text-xs text-violet-700">
              Reference: {paymentPublicId}
            </span>
          ) : null}
        </p>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-slate-800">
          Recent payments
        </h2>
        {loading && payments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No top-up payments yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
            {payments.slice(0, 8).map((p) => (
              <li
                key={p.publicId}
                className="flex justify-between px-3 py-2 text-sm"
              >
                <span>
                  {p.currency} {p.amount.toFixed(2)}{" "}
                  <span className="text-slate-500">({p.status})</span>
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-800">
          Transaction history
        </h2>
        {loading && transactions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No wallet activity yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
            {transactions.slice(0, 15).map((tx) => (
              <li key={tx.id} className="px-3 py-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-slate-800">
                    {tx.type} · {tx.status}
                  </span>
                  <span>
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.currency} {Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
                {tx.note ? (
                  <p className="text-xs text-slate-500">{tx.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
