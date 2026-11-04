"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { UsageAnalytics } from "@/lib/beyond-master/usage-analytics";
import { USAGE_STATUSES } from "@/lib/beyond-master/usage-analytics";

type Ready = Extract<UsageAnalytics, { available: true }>;

export default function OrbitBeyondMasterUsagePage() {
  const [range, setRange] = useState("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      range,
      page: String(page),
      pageSize: "20",
    });
    if (range === "custom") {
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
    }
    if (provider.trim()) params.set("provider", provider.trim());
    if (model.trim()) params.set("model", model.trim());
    if (status) params.set("status", status);
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/orbit/beyond-master/usage?${params.toString()}`,
        );
        const payload = (await response.json().catch(() => null)) as
          (UsageAnalytics & { error?: string }) | null;
        if (cancelled) return;
        if (!response.ok || !payload || !("available" in payload)) {
          setError(payload?.error || "Usage analytics could not be loaded.");
          setAnalytics(null);
          return;
        }
        setAnalytics(payload);
        setError("");
      } catch {
        if (!cancelled) setError("Usage analytics could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range, from, to, provider, model, status, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Usage analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Read-only request totals. Prompts, API keys, and IP addresses are
            not shown.
          </p>
        </div>
        <Link
          href="/orbit/beyond-master"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Overview
        </Link>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-6">
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Range
          <select
            value={range}
            onChange={(event) => {
              setPage(1);
              setRange(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 normal-case"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
        </label>
        {range === "custom" ? (
          <>
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              From
              <input
                type="date"
                value={from}
                onChange={(event) => {
                  setPage(1);
                  setFrom(event.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 normal-case"
              />
            </label>
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              To
              <input
                type="date"
                value={to}
                onChange={(event) => {
                  setPage(1);
                  setTo(event.target.value);
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 normal-case"
              />
            </label>
          </>
        ) : null}
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Provider
          <input
            value={provider}
            onChange={(event) => {
              setPage(1);
              setProvider(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 normal-case"
          />
        </label>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Model
          <input
            value={model}
            onChange={(event) => {
              setPage(1);
              setModel(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 normal-case"
          />
        </label>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Status
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 normal-case"
          >
            <option value="">All statuses</option>
            {USAGE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500" role="status">
          Loading usage analytics…
        </p>
      ) : null}
      {error ? (
        <p
          className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {analytics && !analytics.available ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Migration pending. {analytics.message}
        </p>
      ) : null}
      {analytics?.available ? (
        <ReadyAnalytics analytics={analytics} page={page} setPage={setPage} />
      ) : null}
    </div>
  );
}

function ReadyAnalytics({
  analytics,
  page,
  setPage,
}: {
  analytics: Ready;
  page: number;
  setPage: (page: number) => void;
}) {
  const cards = [
    ["Total requests", String(analytics.summary.totalRequests)],
    ["Successful AI responses", String(analytics.summary.successfulAi)],
    ["Failed requests", String(analytics.summary.failed)],
    ["Account reads", String(analytics.summary.accountReads)],
    ["Unconfigured", String(analytics.summary.unconfigured)],
    ["Rate limited", String(analytics.summary.rateLimited)],
    ["Aborted", String(analytics.summary.aborted)],
    [
      "Average latency",
      analytics.summary.averageLatencyMs == null
        ? "Not stored"
        : `${Math.round(analytics.summary.averageLatencyMs)} ms`,
    ],
    ["Slow requests", String(analytics.summary.slowRequests)],
  ];
  const maxDay = Math.max(1, ...analytics.daily.map((day) => day.requests));
  return (
    <>
      {analytics.empty ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          No usage rows are stored for this filter. These zeros are the stored
          count, not sample data.
        </p>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs tracking-wide text-slate-500 uppercase">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Breakdown
          title="Requests by provider"
          rows={analytics.providers.map((row) => ({
            label: row.provider,
            detail: `${row.requests} requests · ${row.successfulAi} successful AI · ${row.failed} failed`,
          }))}
        />
        <Breakdown
          title="Requests by model"
          rows={analytics.models.map((row) => ({
            label: row.model,
            detail: `${row.requests} requests · ${row.successfulAi} successful AI`,
          }))}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Daily request trend
        </h2>
        {analytics.daily.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No daily requests are stored in this range.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {analytics.daily.map((day) => (
              <li
                key={day.day}
                className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm"
              >
                <span className="text-slate-500">{day.day}</span>
                <span className="h-2 rounded-full bg-slate-100">
                  <span
                    className="block h-2 rounded-full bg-[var(--hb-blue)]"
                    style={{
                      width: `${Math.max(4, Math.round((day.requests / maxDay) * 100))}%`,
                    }}
                  />
                </span>
                <span className="font-semibold text-slate-900">
                  {day.requests}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Token usage</h2>
          <p className="mt-2 text-sm text-slate-600">
            Input tokens: {analytics.tokens.promptTokens ?? "Not stored"}
          </p>
          <p className="text-sm text-slate-600">
            Output tokens: {analytics.tokens.completionTokens ?? "Not stored"}
          </p>
          <p className="text-sm text-slate-600">
            Total tokens: {analytics.tokens.totalTokens ?? "Not stored"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Token totals use stored counts only. Prompt text is not used to
            estimate them.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">DNS activity</h2>
          {analytics.dns.available ? (
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>Proposals in range: {analytics.dns.proposals}</p>
              <p>Verified executed writes: {analytics.dns.executedVerified}</p>
              <p>
                Accepted, not independently verified:{" "}
                {analytics.dns.acceptedUnverified}
              </p>
              <p>Verification mismatch: {analytics.dns.verificationMismatch}</p>
              <p>Uncertain provider results: {analytics.dns.uncertain}</p>
              <p className="text-xs text-slate-500">
                A proposal is not counted as an executed DNS write.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-900">
              {analytics.dns.message}
            </p>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Customer activity
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Shortened customer ids only. Email, passwords, and payment details are
          not loaded.
        </p>
        {analytics.customers.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No customer id is stored on the requests in this filter.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {analytics.customers.map((row) => (
              <li
                key={row.customerRef}
                className="flex justify-between text-sm"
              >
                <span>{row.customerRef}</span>
                <span className="font-semibold">{row.requests}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3">Tokens</th>
              <th className="px-4 py-3">Customer</th>
            </tr>
          </thead>
          <tbody>
            {analytics.rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  No activity rows on this page.
                </td>
              </tr>
            ) : (
              analytics.rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{row.provider}</td>
                  <td className="px-4 py-3">{row.model}</td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">
                    {row.latencyMs == null
                      ? "Not stored"
                      : `${row.latencyMs} ms`}
                  </td>
                  <td className="px-4 py-3">
                    {row.promptTokens == null && row.completionTokens == null
                      ? "Not stored"
                      : `${row.promptTokens ?? 0} / ${row.completionTokens ?? 0}`}
                  </td>
                  <td className="px-4 py-3">
                    {row.customerRef ?? "Not stored"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-slate-500">Page {page}</span>
        <button
          type="button"
          disabled={analytics.rows.length < analytics.pageSize}
          onClick={() => setPage(page + 1)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; detail: string }[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No rows are stored for this breakdown.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li key={row.label}>
              <p className="text-sm font-semibold text-slate-900">
                {row.label}
              </p>
              <p className="text-xs text-slate-500">{row.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
