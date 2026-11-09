"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bot,
  CreditCard,
  Globe2,
  KeyRound,
  Mail,
  Minus,
  Plus,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";

type SignInInfo = {
  country: string | null;
  ip: string | null;
  method: string | null;
  at: string | null;
} | null;

type DirectoryStats = {
  totalCustomers: number;
  emailPasswordUsers: number;
  oauthByProvider: Record<string, number>;
  walletsWithBalance: number;
};

type CustomerListRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  walletBalance: number;
  walletCurrency: string;
  signupMethods: string[];
  oauthProviders: string[];
  lastSignIn: SignInInfo;
  counts: {
    sessions: number;
    hostingOrders: number;
    domainOrders: number;
    walletPayments: number;
  };
};

type WalletTransactionRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  balanceAfter: number | null;
  note: string | null;
  referenceType: string | null;
  createdAt: string;
};

type WalletPaymentRow = {
  publicId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

type CustomerDetail = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  hasPassword: boolean;
  signupMethods: string[];
  lastSignIn: SignInInfo;
  wallet: { balance: number; currency: string } | null;
  oauthAccounts: Array<{ provider: string; linkedAt: string }>;
  sessions: Array<{
    createdAt: string;
    expiresAt: string;
    userAgent: string | null;
    ipAddress: string | null;
  }>;
  hostingOrders: Array<{
    status: string;
    productSlug: string;
    planKey: string;
    total: number;
    currency: string;
    createdAt: string;
    paidAt: string | null;
  }>;
  domainOrders: Array<{
    status: string;
    total: number;
    currency: string;
    createdAt: string;
  }>;
  walletTransactions: WalletTransactionRow[];
  walletPayments: WalletPaymentRow[];
  summary: {
    hostingSpend: number;
    domainSpend: number;
    walletTopUps: number;
  };
};

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryLabel(code: string | null | undefined) {
  if (!code) return "—";
  try {
    return `${countryNames.of(code) ?? code} (${code})`;
  } catch {
    return code;
  }
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

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function methodLabel(methods: string[]) {
  return methods
    .map((method) => {
      if (method === "email") return "Email + password";
      if (method === "google") return "Google";
      if (method === "github") return "GitHub";
      if (method === "facebook") return "Facebook";
      return method;
    })
    .join(" · ");
}

const AMOUNT_PRESETS = [5, 10, 25, 50, 100];

export function OrbitCustomerUsersAdmin() {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<DirectoryStats | null>(null);
  const [customers, setCustomers] = useState<CustomerListRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("25");
  const [reason, setReason] = useState("");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [walletBusy, setWalletBusy] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const selectedRow = useMemo(
    () => customers.find((row) => row.id === selectedId) ?? null,
    [customers, selectedId],
  );

  const loadList = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orbit/customers?q=${encodeURIComponent(q.trim())}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as {
        stats?: DirectoryStats;
        customers?: CustomerListRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load customers");
        return;
      }
      setStats(json.stats ?? null);
      setCustomers(json.customers ?? []);
    } catch {
      setError("Network error while loading customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList("");
  }, [loadList]);

  const loadDetail = useCallback(
    async (userId: string, options?: { keepFeedback?: boolean }) => {
      setSelectedId(userId);
      setLoading(true);
      setError(null);
      if (!options?.keepFeedback) {
        setMessage(null);
        setPasswordNotice(null);
      }
      setNewPassword("");
      setConfirmPassword("");
      try {
        const res = await fetch(
          `/api/orbit/customers/${encodeURIComponent(userId)}`,
          { cache: "no-store" },
        );
        const json = (await res.json()) as {
          customer?: CustomerDetail;
          error?: string;
        };
        if (!res.ok) {
          setError(json.error ?? "Failed to load customer");
          setDetail(null);
          return;
        }
        setDetail(json.customer ?? null);
      } catch {
        setError("Network error while loading this customer.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  async function adjustWallet() {
    if (!detail) return;
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Enter a wallet amount greater than zero.");
      return;
    }
    if (!reason.trim()) {
      setError("An audit reason is required for every wallet change.");
      return;
    }
    setWalletBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/orbit/wallets/adjust", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          userId: detail.id,
          direction,
          amount: numeric,
          reason: reason.trim(),
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setError(
          json.error === "insufficient_funds"
            ? "Balance is lower than this debit — reduce the amount."
            : res.status === 401
              ? "Your Orbit session expired — sign in again, then retry."
              : json.error === "Cross-origin request blocked."
                ? "Security check rejected this request. Reload Orbit and retry."
                : (json.error ?? `Wallet adjustment failed (${res.status}).`),
        );
        return;
      }
      setMessage(
        direction === "credit"
          ? `Added ${formatMoney(numeric, detail.wallet?.currency ?? "USD")} to the wallet.`
          : `Removed ${formatMoney(numeric, detail.wallet?.currency ?? "USD")} from the wallet.`,
      );
      setReason("");
      await loadDetail(detail.id, { keepFeedback: true });
      void loadList(query);
    } catch {
      setError("Network error while updating the wallet.");
    } finally {
      setWalletBusy(false);
    }
  }

  async function reverseTransaction(tx: WalletTransactionRow) {
    const why = window.prompt(
      `Reverse this ${formatMoney(tx.amount, tx.currency)} credit? Enter audit reason:`,
      "",
    );
    if (!why?.trim()) return;
    setWalletBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/orbit/wallets/adjust", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "reverse",
          walletTransactionId: tx.id,
          reason: why.trim(),
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Your Orbit session expired — sign in again, then retry."
            : (json.error ?? `Reversal failed (${res.status}).`),
        );
        return;
      }
      setMessage("Credit reversed and recorded in the audit log.");
      if (detail) {
        await loadDetail(detail.id, { keepFeedback: true });
        void loadList(query);
      }
    } catch {
      setError("Network error while reversing the credit.");
    } finally {
      setWalletBusy(false);
    }
  }

  async function setCustomerPassword() {
    if (!detail) return;
    if (newPassword.length < 8) {
      setPasswordNotice("Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice("New password and confirmation do not match.");
      return;
    }
    setPasswordBusy(true);
    setPasswordNotice(null);
    try {
      const res = await fetch(
        `/api/orbit/customers/${encodeURIComponent(detail.id)}/reset-password`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ newPassword }),
        },
      );
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setPasswordNotice(json.error ?? "Password update failed");
        return;
      }
      setPasswordNotice(
        detail.hasPassword
          ? "Password replaced. The customer can sign in with email + this password."
          : "Password created. The customer can now sign in with email + this password, and Google keeps working.",
      );
      setNewPassword("");
      setConfirmPassword("");
      await loadDetail(detail.id, { keepFeedback: true });
    } catch {
      setPasswordNotice("Network error while updating the password.");
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total signups", value: stats.totalCustomers },
            { label: "Email + password", value: stats.emailPasswordUsers },
            {
              label: "Google sign-ins",
              value: stats.oauthByProvider.google ?? 0,
            },
            { label: "Wallets with balance", value: stats.walletsWithBalance },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-xs text-slate-500 uppercase">{item.label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void loadList(query);
          }}
          placeholder="Search customer name, country, or email"
          className="min-w-[240px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void loadList(query)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--hb-blue)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          Search
        </button>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">
            Registered users ({customers.length})
          </div>
          <ul className="max-h-[640px] divide-y divide-slate-100 overflow-y-auto">
            {customers.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                No customers found.
              </li>
            ) : (
              customers.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(row.id)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                      selectedId === row.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {row.name?.trim() || "No name on signup"}
                        </p>
                        <p className="truncate text-xs text-slate-600">
                          {row.email}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {formatMoney(row.walletBalance, row.walletCurrency)}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Globe2 className="size-3" />
                        {countryLabel(row.lastSignIn?.country)}
                      </span>
                      <span>{methodLabel(row.signupMethods)}</span>
                      <span>joined {formatDate(row.createdAt)}</span>
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="space-y-4">
          {!detail ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
              Select a customer to review their full profile, wallet balance,
              purchases, and sign-in options.
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {detail.name?.trim() || "No name on signup"}
                    </h2>
                    <p className="inline-flex items-center gap-1.5 truncate text-sm text-slate-600">
                      <Mail className="size-3.5" />
                      {detail.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">
                      Wallet
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {formatMoney(
                        detail.wallet?.balance ?? 0,
                        detail.wallet?.currency ?? "USD",
                      )}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-slate-500">Country</dt>
                    <dd className="font-medium text-slate-900">
                      {countryLabel(
                        detail.lastSignIn?.country ??
                          selectedRow?.lastSignIn?.country,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Sign-in methods</dt>
                    <dd className="font-medium text-slate-900">
                      {methodLabel(detail.signupMethods)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Customer since</dt>
                    <dd className="font-medium text-slate-900">
                      {formatDate(detail.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Last sign-in</dt>
                    <dd className="font-medium text-slate-900">
                      {formatDate(detail.lastSignIn?.at)}
                      {detail.lastSignIn?.ip ? (
                        <span className="ml-1 text-xs text-slate-500">
                          · {detail.lastSignIn.ip}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Wallet top-ups</p>
                    <p className="font-semibold text-slate-900">
                      {formatMoney(
                        detail.summary.walletTopUps,
                        detail.wallet?.currency ?? "USD",
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Hosting spend</p>
                    <p className="font-semibold text-slate-900">
                      {formatMoney(detail.summary.hostingSpend, "USD")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Domain spend</p>
                    <p className="font-semibold text-slate-900">
                      {formatMoney(detail.summary.domainSpend, "USD")}
                    </p>
                  </div>
                </div>

                {detail.oauthAccounts.length > 0 ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <BadgeCheck className="size-3.5" />
                    Linked:{" "}
                    {detail.oauthAccounts.map((a) => a.provider).join(", ")}
                  </p>
                ) : null}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Wallet className="size-4" />
                  Wallet balance
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Credits and debits are ledger entries with an audit reason.
                  Customers spend this balance on hosting and domains at
                  checkout.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDirection("credit")}
                      className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium ${
                        direction === "credit"
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      <Plus className="size-3.5" />
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection("debit")}
                      className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium ${
                        direction === "debit"
                          ? "bg-red-600 text-white"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      <Minus className="size-3.5" />
                      Remove
                    </button>
                  </div>

                  <input
                    type="number"
                    min={0.01}
                    max={10000}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    aria-label="Amount"
                  />

                  <div className="flex flex-wrap gap-1">
                    {AMOUNT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(String(preset))}
                        className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Audit reason (required) — e.g. goodwill credit, refund"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />

                <button
                  type="button"
                  onClick={() => void adjustWallet()}
                  disabled={walletBusy}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <CreditCard className="size-4" />
                  {walletBusy
                    ? "Applying…"
                    : direction === "credit"
                      ? "Add to wallet"
                      : "Remove from wallet"}
                </button>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Wallet ledger
                  </p>
                  <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto text-xs">
                    {detail.walletTransactions.length === 0 ? (
                      <li className="text-slate-500">
                        No wallet activity yet.
                      </li>
                    ) : (
                      detail.walletTransactions.map((tx) => (
                        <li
                          key={tx.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5"
                        >
                          <span className="min-w-0">
                            <span className="font-semibold text-slate-800">
                              {tx.type} · {formatMoney(tx.amount, tx.currency)}
                            </span>
                            <span className="block truncate text-slate-500">
                              {formatDate(tx.createdAt)}
                              {tx.note ? ` · ${tx.note}` : ""}
                            </span>
                          </span>
                          {tx.type === "CREDIT" && tx.status === "COMPLETED" ? (
                            <button
                              type="button"
                              onClick={() => void reverseTransaction(tx)}
                              disabled={walletBusy}
                              className="shrink-0 rounded-md border border-slate-300 px-2 py-0.5 font-medium text-slate-700 hover:bg-white disabled:opacity-50"
                            >
                              Reverse
                            </button>
                          ) : null}
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {detail.walletPayments.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Card top-ups
                    </p>
                    <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600">
                      {detail.walletPayments.map((payment) => (
                        <li key={payment.publicId}>
                          {formatMoney(payment.amount, payment.currency)} ·{" "}
                          {payment.status} · {formatDate(payment.createdAt)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-amber-950">
                  <KeyRound className="size-4" />
                  {detail.hasPassword ? "Replace password" : "Set a password"}
                </h3>
                <p className="mt-1 text-xs text-amber-900/80">
                  {detail.hasPassword
                    ? "No current password is needed for an admin reset. The customer keeps their OAuth sign-in too."
                    : "This customer signed in with Google and has no password. Create one so email sign-in works as well — no current password required."}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    autoComplete="new-password"
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={passwordBusy}
                  onClick={() => void setCustomerPassword()}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  <ShieldCheck className="size-4" />
                  {passwordBusy
                    ? "Saving…"
                    : detail.hasPassword
                      ? "Update password"
                      : "Create password"}
                </button>
                {passwordNotice ? (
                  <p className="mt-2 text-xs font-medium text-amber-900">
                    {passwordNotice}
                  </p>
                ) : null}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ReceiptText className="size-4" />
                  Purchases
                </h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Hosting orders
                    </p>
                    <ul className="mt-1 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-700">
                      {detail.hostingOrders.length === 0 ? (
                        <li className="text-slate-500">None</li>
                      ) : (
                        detail.hostingOrders.map((order) => (
                          <li key={`${order.createdAt}-${order.planKey}`}>
                            {order.productSlug}/{order.planKey} · {order.status}{" "}
                            · {formatMoney(order.total, order.currency)}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Domain orders
                    </p>
                    <ul className="mt-1 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-700">
                      {detail.domainOrders.length === 0 ? (
                        <li className="text-slate-500">None</li>
                      ) : (
                        detail.domainOrders.map((order) => (
                          <li key={`${order.createdAt}-${order.status}`}>
                            {order.status} ·{" "}
                            {formatMoney(order.total, order.currency)}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Bot className="size-4" />
                  Recent logins
                </h3>
                <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600">
                  {detail.sessions.length === 0 ? (
                    <li>No session records.</li>
                  ) : (
                    detail.sessions.map((session, index) => (
                      <li key={`${session.createdAt}-${index}`}>
                        {formatDate(session.createdAt)} ·{" "}
                        {session.ipAddress ?? "IP unknown"} ·{" "}
                        {(session.userAgent ?? "").slice(0, 70)}
                      </li>
                    ))
                  )}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
