"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORIES = ["dns", "ticket", "usage", "authentication"] as const;

type Section = { available: boolean; count?: number; message?: string };

type EventRow = {
  id: string;
  createdAt: string;
  category: string;
  action: string;
  resourceRef: string | null;
  status: string | null;
  description: string;
};

type Payload = {
  sections: {
    dns: Section;
    tickets: Section;
    accountReads: Section;
    aiFailures: Section;
    authentication: Section;
  };
  events: EventRow[];
  total: number;
  page: number;
  pageSize: number;
  rateLimit?: { scope: string; note: string };
  error?: string;
};

const CARDS: { key: keyof Payload["sections"]; label: string }[] = [
  { key: "dns", label: "DNS operations" },
  { key: "tickets", label: "Ticket activity" },
  { key: "accountReads", label: "Account-sensitive reads" },
  { key: "aiFailures", label: "AI errors and timeouts" },
  { key: "authentication", label: "Authentication events" },
];

export default function OrbitBeyondMasterSecurityPage() {
  const [category, setCategory] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState(daysAgo(7));
  const [to, setTo] = useState(daysAgo(0));
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (category) params.set("category", category);
    if (action.trim()) params.set("action", action.trim());
    if (status.trim()) params.set("status", status.trim());
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(`${to}T23:59:59`).toISOString());
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/orbit/beyond-master/security?${params.toString()}`,
        );
        const payload = (await response
          .json()
          .catch(() => null)) as Payload | null;
        if (cancelled) return;
        if (!response.ok || !payload?.sections) {
          setError(payload?.error || "Security events could not be loaded.");
          setData(null);
          return;
        }
        setData(payload);
        setError("");
      } catch {
        if (!cancelled) setError("Security events could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, action, status, from, to, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Security and audit
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Read-only Beyond Master events from the existing audit, usage,
            ticket, and Orbit activity records.
          </p>
        </div>
        <Link
          href="/orbit/beyond-master"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Overview
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Loading security events…</p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((card) => {
            const section = data.sections[card.key];
            return (
              <div
                key={card.key}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {card.label}
                </p>
                {section.available ? (
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {section.count}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-amber-900">
                    {section.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Category
          <select
            value={category}
            onChange={(event) => {
              setPage(1);
              setCategory(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
          >
            <option value="">All</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Action
          <input
            value={action}
            onChange={(event) => {
              setPage(1);
              setAction(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
          />
        </label>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Status
          <input
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
          />
        </label>
        <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => {
              setPage(1);
              setFrom(event.target.value);
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
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
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
          />
        </label>
      </form>
      {data?.rateLimit ? (
        <p className="text-sm text-slate-500">{data.rateLimit.note}</p>
      ) : null}
      {data && data.events.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          No events match these filters.
        </p>
      ) : null}
      {data && data.events.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Resource</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => (
                  <tr key={event.id} className="border-t border-slate-100">
                    <td className="px-3 py-3 text-slate-500">
                      {formatWhen(event.createdAt)}
                    </td>
                    <td className="px-3 py-3">{event.category}</td>
                    <td className="px-3 py-3">{event.action}</td>
                    <td className="px-3 py-3">{event.resourceRef ?? "—"}</td>
                    <td className="px-3 py-3">{event.status ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-700">
                      {event.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {data.events.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {event.category} · {event.action}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {event.description}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {event.resourceRef ?? "No resource"} ·{" "}
                  {event.status ?? "No status"} · {formatWhen(event.createdAt)}
                </p>
              </article>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-slate-500">
              Page {data.page} of {pages} · {data.total} matching
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 disabled:opacity-40"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
