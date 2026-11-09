"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";

type WalletCustomer = {
  id: string;
  email: string;
  name: string | null;
  balance: number;
  currency: string;
};

type LedgerRow = {
  id: string;
  type: string;
  status: string;
  amount: unknown;
  currency: string;
  balanceAfter: unknown;
  note: string | null;
  referenceType: string | null;
  createdAt: string;
};

type PaymentRow = {
  publicId: string;
  amount: unknown;
  currency: string;
  status: string;
  createdAt: string;
};

function toNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrbitWalletAdmin() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<WalletCustomer[]>([]);
  const [selected, setSelected] = useState<WalletCustomer | null>(null);
  const [transactions, setTransactions] = useState<LedgerRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orbit/wallets?q=${encodeURIComponent(term.trim())}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as {
        customers?: WalletCustomer[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Could not load wallets");
        return;
      }
      setCustomers(json.customers ?? []);
    } catch {
      setError("Network error while loading wallets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void search("");
  }, [search]);

  async function loadCustomer(customer: WalletCustomer) {
    setSelected(customer);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orbit/wallets?userId=${encodeURIComponent(customer.id)}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as {
        user?: WalletCustomer;
        transactions?: LedgerRow[];
        payments?: PaymentRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Could not load this wallet");
        return;
      }
      if (json.user) setSelected(json.user);
      setTransactions(json.transactions ?? []);
      setPayments(json.payments ?? []);
    } catch {
      setError("Network error while loading this wallet.");
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const balance = customers.reduce((sum, row) => sum + row.balance, 0);
    const funded = customers.filter((row) => row.balance > 0).length;
    return { balance, funded };
  }, [customers]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void search(query);
            }}
            placeholder="Search customer email or name"
            className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void search(query)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#673de6] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          Search
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Customers listed</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {customers.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Wallets funded</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {totals.funded}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Combined balance</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatMoney(totals.balance, "USD")}
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">
            Wallets
          </div>
          <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
            {customers.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                No wallets found.
              </li>
            ) : (
              customers.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => void loadCustomer(customer)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      selected?.id === customer.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {customer.name?.trim() || customer.email}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {customer.email}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {formatMoney(customer.balance, customer.currency)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selected ? (
            <p className="text-sm text-slate-500">
              Pick a customer to inspect their ledger. Credits and debits are
              applied from{" "}
              <span className="font-medium text-slate-700">
                Customers → Users &amp; wallets
              </span>
              .
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-900">
                    {selected.name?.trim() || selected.email}
                  </h2>
                  <p className="truncate text-sm text-slate-600">
                    {selected.email}
                  </p>
                </div>
                <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
                  <Wallet className="size-4" />
                  {formatMoney(selected.balance, selected.currency)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Ledger ({transactions.length})
                </p>
                <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto text-xs">
                  {transactions.length === 0 ? (
                    <li className="text-slate-500">No ledger entries.</li>
                  ) : (
                    transactions.map((row) => {
                      const inward =
                        row.type === "CREDIT" || row.type === "REFUND";
                      return (
                        <li
                          key={row.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {inward ? (
                              <ArrowDownLeft className="size-3.5 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="size-3.5 text-red-600" />
                            )}
                            <span className="font-semibold text-slate-800">
                              {row.type} ·{" "}
                              {formatMoney(toNumber(row.amount), row.currency)}
                            </span>
                          </span>
                          <span className="truncate text-slate-500">
                            {formatDate(row.createdAt)}
                          </span>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Card top-ups ({payments.length})
                </p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600">
                  {payments.length === 0 ? (
                    <li>No Stripe top-ups.</li>
                  ) : (
                    payments.map((payment) => (
                      <li
                        key={payment.publicId}
                        className="inline-flex items-center gap-1.5"
                      >
                        <CreditCard className="size-3.5" />
                        {formatMoney(
                          toNumber(payment.amount),
                          payment.currency,
                        )}{" "}
                        · {payment.status} · {formatDate(payment.createdAt)}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
