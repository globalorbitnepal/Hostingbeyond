"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type {
  AdminTicketCounts,
  AdminTicketListItem,
  AdminTicketView,
} from "@/lib/beyond-master/tickets/types";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/lib/beyond-master/tickets/types";

type Queue = {
  available: true;
  counts: AdminTicketCounts;
  tickets: AdminTicketListItem[];
  total: number;
  page: number;
  pageSize: number;
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_customer: "Waiting for customer",
  waiting_support: "Waiting for support",
  resolved: "Resolved",
  closed: "Closed",
};

const COUNT_CARDS: { key: keyof AdminTicketCounts; label: string }[] = [
  { key: "total", label: "Total" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "waiting_customer", label: "Waiting for customer" },
  { key: "waiting_support", label: "Waiting for support" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
  { key: "urgent", label: "Urgent" },
];

export default function OrbitBeyondMasterTicketsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"created" | "updated">("updated");
  const [page, setPage] = useState(1);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [migration, setMigration] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [ticket, setTicket] = useState<AdminTicketView | null>(null);
  const [detailError, setDetailError] = useState("");
  const [notice, setNotice] = useState("");
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      sort,
    });
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (category) params.set("category", category);
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/orbit/beyond-master/tickets?${params.toString()}`,
        );
        const payload = (await response.json().catch(() => null)) as {
          available?: boolean;
          message?: string;
          error?: string;
          counts?: Queue["counts"];
          tickets?: Queue["tickets"];
          total?: number;
          page?: number;
          pageSize?: number;
        } | null;
        if (cancelled) return;
        if (payload?.available === false && payload.message) {
          setMigration(payload.message);
          setQueue(null);
          setError("");
          return;
        }
        if (
          !response.ok ||
          !payload ||
          payload.available !== true ||
          !payload.counts ||
          !payload.tickets
        ) {
          setError(payload?.error || "Support tickets could not be loaded.");
          setQueue(null);
          setMigration("");
          return;
        }
        setQueue(payload as Queue);
        setMigration("");
        setError("");
      } catch {
        if (!cancelled) setError("Support tickets could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, status, priority, category, sort, page, reload]);

  useEffect(() => {
    if (!selected) {
      setTicket(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      setDetailError("");
      const response = await fetch(
        `/api/orbit/beyond-master/tickets/${encodeURIComponent(selected)}`,
      );
      const payload = (await response.json().catch(() => null)) as {
        ticket?: AdminTicketView;
        error?: string;
      } | null;
      if (cancelled) return;
      if (!response.ok || !payload?.ticket) {
        setTicket(null);
        setDetailError(payload?.error || "That ticket could not be loaded.");
        return;
      }
      setTicket(payload.ticket);
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  async function patchTicket(next: { status?: string; priority?: string }) {
    if (!ticket) return;
    if (next.status === "closed" && !window.confirm("Close this ticket?"))
      return;
    setBusy(true);
    setNotice("");
    const response = await fetch(
      `/api/orbit/beyond-master/tickets/${encodeURIComponent(ticket.reference)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      ticket?: AdminTicketView;
      error?: string;
    } | null;
    setBusy(false);
    if (!response.ok || !payload?.ticket) {
      setNotice(payload?.error || "The ticket could not be updated.");
      return;
    }
    setTicket(payload.ticket);
    setNotice("Ticket updated.");
    setReload((current) => current + 1);
  }

  async function sendReply() {
    if (!ticket || reply.trim().length < 2) return;
    setBusy(true);
    setNotice("");
    const response = await fetch(
      `/api/orbit/beyond-master/tickets/${encodeURIComponent(ticket.reference)}/replies`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: reply }),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      ticket?: AdminTicketView;
      emailNotice?: string;
      error?: string;
    } | null;
    setBusy(false);
    if (!response.ok || !payload?.ticket) {
      setNotice(payload?.error || "The reply could not be saved.");
      return;
    }
    setTicket(payload.ticket);
    setReply("");
    setNotice(payload.emailNotice || "Reply saved.");
    setReload((current) => current + 1);
  }

  async function sendNote() {
    if (!ticket || note.trim().length < 2) return;
    setBusy(true);
    setNotice("");
    const response = await fetch(
      `/api/orbit/beyond-master/tickets/${encodeURIComponent(ticket.reference)}/notes`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: note }),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      ticket?: AdminTicketView;
      error?: string;
    } | null;
    setBusy(false);
    if (!response.ok || !payload?.ticket) {
      setNotice(payload?.error || "The note could not be saved.");
      return;
    }
    setTicket(payload.ticket);
    setNote("");
    setNotice("Internal note saved. Customers cannot see it.");
    setReload((current) => current + 1);
  }

  const pages = queue
    ? Math.max(1, Math.ceil(queue.total / queue.pageSize))
    : 1;
  const handoff =
    Boolean(ticket?.handoff) ||
    ticket?.activity.some((entry) => entry.action === "human_handoff");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support tickets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Beyond Master tickets for the signed-in Orbit admin. This does not
            show a live agent connection.
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
        <p className="text-sm text-slate-500">Loading tickets…</p>
      ) : null}
      {migration ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {migration}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {queue ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COUNT_CARDS.map((card) => (
            <div
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {queue.counts[card.key]}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {migration ? null : (
        <form
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase md:col-span-2">
            Search reference or subject
            <input
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
            />
          </label>
          <Filter
            label="Status"
            value={status}
            options={TICKET_STATUSES}
            onChange={setStatus}
            resetPage={() => setPage(1)}
          />
          <Filter
            label="Priority"
            value={priority}
            options={TICKET_PRIORITIES}
            onChange={setPriority}
            resetPage={() => setPage(1)}
          />
          <Filter
            label="Category"
            value={category}
            options={TICKET_CATEGORIES}
            onChange={setCategory}
            resetPage={() => setPage(1)}
          />
          <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Sort
            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value === "created" ? "created" : "updated",
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
            >
              <option value="updated">Last updated</option>
              <option value="created">Created date</option>
            </select>
          </label>
        </form>
      )}

      {queue && queue.tickets.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          No tickets match these filters.
        </p>
      ) : null}

      {queue && queue.tickets.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-3 py-3">Reference</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {queue.tickets.map((row) => (
                <tr
                  key={row.reference}
                  className={
                    selected === row.reference
                      ? "bg-sky-50"
                      : "border-t border-slate-100"
                  }
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="font-semibold text-sky-700"
                      onClick={() => setSelected(row.reference)}
                    >
                      {row.reference}
                    </button>
                    {row.handoff ? (
                      <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
                        AI handoff
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-slate-800">{row.subject}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {row.customerRef}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{row.category}</td>
                  <td className="px-3 py-3">
                    <PriorityBadge value={row.priority} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge value={row.status} />
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {formatWhen(row.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {formatWhen(row.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3 text-sm">
            <p className="text-slate-500">
              Page {queue.page} of {pages} · {queue.total} matching
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailError ? (
        <p className="text-sm text-rose-700">{detailError}</p>
      ) : null}
      {notice ? (
        <p className="text-sm font-medium text-slate-800">{notice}</p>
      ) : null}

      {ticket ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {ticket.reference} · {ticket.subject}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {ticket.category} · created {formatWhen(ticket.createdAt)} ·
                updated {formatWhen(ticket.updatedAt)}
              </p>
              {handoff ? (
                <p className="mt-2 inline-flex rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-800">
                  Opened from a Beyond Master AI handoff. No agent is shown as
                  online.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={ticket.status} />
              <PriorityBadge value={ticket.priority} />
            </div>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Customer
              </dt>
              <dd className="text-slate-800">
                {shortCustomer(ticket.customerUserId)}
              </dd>
            </div>
            {ticket.domainName ? (
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Domain
                </dt>
                <dd className="text-slate-800">{ticket.domainName}</dd>
              </div>
            ) : null}
            {ticket.serviceLabel ? (
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Service
                </dt>
                <dd className="text-slate-800">{ticket.serviceLabel}</dd>
              </div>
            ) : null}
          </dl>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Customer message
            </h3>
            <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-800">
              {ticket.description}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Status
              <select
                value={ticket.status}
                disabled={busy}
                onChange={(event) =>
                  void patchTicket({ status: event.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
              >
                {TICKET_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Priority
              <select
                value={ticket.priority}
                disabled={busy}
                onChange={(event) =>
                  void patchTicket({ priority: event.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
              >
                {TICKET_PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Customer-visible replies
            </h3>
            <div className="mt-2 space-y-2">
              {ticket.messages.length === 0 ? (
                <p className="text-sm text-slate-500">No replies yet.</p>
              ) : null}
              {ticket.messages.map((message) => (
                <article
                  key={message.publicId}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {message.authorType} · {formatWhen(message.createdAt)}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">
                    {message.body}
                  </p>
                </article>
              ))}
            </div>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              maxLength={4000}
              rows={3}
              placeholder="Reply the customer will see"
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={busy || reply.trim().length < 2}
              onClick={() => void sendReply()}
              className="mt-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Save reply
            </button>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Internal notes
            </h3>
            <div className="mt-2 space-y-2">
              {ticket.internalNotes.length === 0 ? (
                <p className="text-sm text-slate-500">No internal notes.</p>
              ) : null}
              {ticket.internalNotes.map((message) => (
                <article
                  key={message.publicId}
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3"
                >
                  <p className="text-xs font-semibold text-amber-800">
                    Internal · {formatWhen(message.createdAt)}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap text-amber-950">
                    {message.body}
                  </p>
                </article>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={4000}
              rows={3}
              placeholder="Internal note, hidden from the customer"
              className="mt-3 w-full rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={busy || note.trim().length < 2}
              onClick={() => void sendNote()}
              className="mt-2 rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950 disabled:opacity-40"
            >
              Save internal note
            </button>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Activity</h3>
            <ol className="mt-2 space-y-2">
              {ticket.activity.map((entry, index) => (
                <li
                  key={`${entry.action}-${entry.createdAt}-${index}`}
                  className="text-sm text-slate-700"
                >
                  <span className="font-semibold">{entry.action}</span>
                  {entry.detail ? ` · ${entry.detail}` : ""} ·{" "}
                  {formatWhen(entry.createdAt)}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Filter({
  label,
  value,
  options,
  onChange,
  resetPage,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  resetPage: () => void;
}) {
  return (
    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <select
        value={value}
        onChange={(event) => {
          resetPage();
          onChange(event.target.value);
        }}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900 normal-case"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABEL[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "urgent" || value === "open"
      ? "bg-sky-100 text-sky-800"
      : value === "closed" || value === "resolved"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-slate-100 text-slate-700";
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>
      {STATUS_LABEL[value] ?? value}
    </span>
  );
}

function PriorityBadge({ value }: { value: string }) {
  const tone =
    value === "urgent" || value === "high"
      ? "bg-rose-100 text-rose-800"
      : "bg-slate-100 text-slate-700";
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>
      {value}
    </span>
  );
}

function shortCustomer(id: string) {
  if (!id || id.includes("@") || id.length <= 8) return "customer";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
