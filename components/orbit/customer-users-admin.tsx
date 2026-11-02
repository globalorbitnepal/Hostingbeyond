"use client";

import { useCallback, useEffect, useState } from "react";

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
  counts: {
    sessions: number;
    hostingOrders: number;
    domainOrders: number;
    walletPayments: number;
  };
};

type CustomerDetail = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  hasPassword: boolean;
  signupMethods: string[];
  wallet: { balance: number; currency: string } | null;
  oauthAccounts: Array<{
    provider: string;
    linkedAt: string;
  }>;
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
  walletPayments: Array<{
    publicId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  walletTransactions: Array<{
    type: string;
    amount: number;
    currency: string;
    note: string | null;
    createdAt: string;
  }>;
  summary: {
    hostingSpend: number;
    domainSpend: number;
    walletTopUps: number;
  };
};

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
  return new Date(iso).toLocaleString();
}

export function OrbitCustomerUsersAdmin() {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<DirectoryStats | null>(null);
  const [customers, setCustomers] = useState<CustomerListRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async (q: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/orbit/customers?q=${encodeURIComponent(q.trim())}`,
      );
      const json = (await res.json()) as {
        stats?: DirectoryStats;
        customers?: CustomerListRow[];
        error?: string;
      };
      if (!res.ok) {
        setMessage(json.error ?? "Failed to load customers");
        return;
      }
      setStats(json.stats ?? null);
      setCustomers(json.customers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList("");
  }, [loadList]);

  async function loadDetail(userId: string) {
    setSelectedId(userId);
    setDetail(null);
    setNewPassword("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orbit/customers/${encodeURIComponent(userId)}`,
      );
      const json = (await res.json()) as {
        customer?: CustomerDetail;
        error?: string;
      };
      if (!res.ok) {
        setMessage(json.error ?? "Failed to load customer");
        return;
      }
      setDetail(json.customer ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!selectedId || newPassword.trim().length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/orbit/customers/${encodeURIComponent(selectedId)}/reset-password`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ newPassword: newPassword.trim() }),
        },
      );
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setMessage(json.error ?? "Password reset failed");
        return;
      }
      setMessage(
        "Password updated. Customer can sign in with email + new password.",
      );
      setNewPassword("");
      await loadDetail(selectedId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total signups", value: stats.totalCustomers },
            {
              label: "Email + password",
              value: stats.emailPasswordUsers,
            },
            {
              label: "Google sign-ins",
              value: stats.oauthByProvider.google ?? 0,
            },
            {
              label: "Wallets with balance",
              value: stats.walletsWithBalance,
            },
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
          placeholder="Search by email or name"
          className="min-w-[240px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void loadList(query)}
          className="rounded-xl bg-[var(--hb-blue)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Search
        </button>
      </div>

      {message ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">
            Customers ({customers.length})
          </div>
          <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
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
                    className={`w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                      selectedId === row.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <p className="font-medium text-slate-900">{row.email}</p>
                    <p className="text-slate-600">
                      {row.name || "—"} · joined {formatDate(row.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.signupMethods.join(", ")} · wallet{" "}
                      {formatMoney(row.walletBalance, row.walletCurrency)}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!detail ? (
            <p className="text-sm text-slate-500">
              Select a customer to view signup method, purchases, wallet
              activity, and reset password.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {detail.name || detail.email}
                </h2>
                <p className="text-sm text-slate-600">{detail.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Signed up {formatDate(detail.createdAt)} ·{" "}
                  {detail.signupMethods.join(" + ")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Wallet balance</p>
                  <p className="font-semibold">
                    {detail.wallet
                      ? formatMoney(
                          detail.wallet.balance,
                          detail.wallet.currency,
                        )
                      : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Wallet top-ups</p>
                  <p className="font-semibold">
                    {formatMoney(
                      detail.summary.walletTopUps,
                      detail.wallet?.currency ?? "USD",
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Hosting + domains</p>
                  <p className="text-sm font-semibold">
                    {formatMoney(detail.summary.hostingSpend, "USD")} /{" "}
                    {formatMoney(detail.summary.domainSpend, "USD")}
                  </p>
                </div>
              </div>

              {detail.oauthAccounts.length > 0 ? (
                <section>
                  <h3 className="text-sm font-semibold">OAuth linked</h3>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {detail.oauthAccounts.map((a) => (
                      <li key={a.provider}>
                        {a.provider} · linked {formatDate(a.linkedAt)}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section>
                <h3 className="text-sm font-semibold">Recent logins</h3>
                <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto text-xs text-slate-600">
                  {detail.sessions.length === 0 ? (
                    <li>No session records.</li>
                  ) : (
                    detail.sessions.map((s, i) => (
                      <li key={`${s.createdAt}-${i}`}>
                        {formatDate(s.createdAt)} ·{" "}
                        {s.ipAddress ?? "IP unknown"} ·{" "}
                        {(s.userAgent ?? "").slice(0, 80)}
                      </li>
                    ))
                  )}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Purchases</h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Hosting orders
                    </p>
                    <ul className="mt-1 max-h-28 space-y-1 overflow-y-auto text-xs">
                      {detail.hostingOrders.length === 0 ? (
                        <li className="text-slate-500">None</li>
                      ) : (
                        detail.hostingOrders.map((o) => (
                          <li key={o.createdAt + o.planKey}>
                            {o.productSlug}/{o.planKey} · {o.status} ·{" "}
                            {formatMoney(o.total, o.currency)}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Domain orders
                    </p>
                    <ul className="mt-1 max-h-28 space-y-1 overflow-y-auto text-xs">
                      {detail.domainOrders.length === 0 ? (
                        <li className="text-slate-500">None</li>
                      ) : (
                        detail.domainOrders.map((o) => (
                          <li key={o.createdAt + o.status}>
                            {o.status} · {formatMoney(o.total, o.currency)}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <h3 className="text-sm font-semibold text-amber-950">
                  Reset password
                </h3>
                <p className="mt-1 text-xs text-amber-900/80">
                  Sets a new email login password for this customer (OAuth links
                  stay active). Minimum 8 characters.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="min-w-[200px] flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void resetPassword()}
                    className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Update password
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
