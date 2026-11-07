"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  threadId: string;
  title: string;
  status: string;
  queueStatus: string | null;
  customer: { id: string; name: string | null; email: string } | null;
  assigned: { id: string; displayName: string } | null;
  ticketReference: string | null;
  updatedAt: string;
  messageCount: number;
};

export default function OrbitBeyondMasterSupportQueuePage() {
  const [status, setStatus] = useState<"open" | "assigned" | "all">("open");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [replyThread, setReplyThread] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [linkThread, setLinkThread] = useState<string | null>(null);
  const [linkRef, setLinkRef] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/orbit/beyond-master/support-queue?status=${encodeURIComponent(status)}`,
        { cache: "no-store" },
      );
      const payload = (await res.json().catch(() => null)) as {
        threads?: Row[];
        error?: string;
      } | null;
      if (!res.ok) {
        setError(payload?.error ?? "Queue could not be loaded.");
        setRows([]);
        return;
      }
      setRows(payload?.threads ?? []);
    } catch {
      setError("Queue could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function assign(threadId: string) {
    setBusyId(threadId);
    try {
      const res = await fetch("/api/orbit/beyond-master/support-queue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "assign", threadId }),
      });
      if (!res.ok) {
        setError("Assignment failed.");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function sendReply() {
    if (!replyThread || !replyBody.trim()) return;
    setBusyId(replyThread);
    try {
      const res = await fetch("/api/orbit/beyond-master/support-queue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "message",
          threadId: replyThread,
          body: replyBody.trim(),
        }),
      });
      if (!res.ok) {
        setError("Message was not saved.");
        return;
      }
      setReplyBody("");
      setReplyThread(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function linkTicket() {
    if (!linkThread || !/^BM-[0-9]+$/.test(linkRef.trim())) return;
    setBusyId(linkThread);
    try {
      const res = await fetch("/api/orbit/beyond-master/support-queue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "link_ticket",
          threadId: linkThread,
          reference: linkRef.trim(),
        }),
      });
      if (!res.ok) {
        setError("Ticket link failed.");
        return;
      }
      setLinkRef("");
      setLinkThread(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">
          AI Agent — live support queue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Open threads where a customer asked for a human. Customers never
          access Orbit; staff reply is appended to the saved conversation.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {(["open", "assigned", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              status === s
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "All queued" : s}
          </button>
        ))}
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No threads in this filter.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.threadId}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{row.title}</p>
                  <p className="text-xs text-slate-500">
                    {row.customer?.email || row.customer?.name || "Guest"} ·{" "}
                    {row.messageCount} messages · {row.queueStatus}
                    {row.ticketReference
                      ? ` · Ticket ${row.ticketReference}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.queueStatus === "open" ? (
                    <button
                      type="button"
                      className="rounded-full bg-violet-700 px-3 py-1 text-xs font-semibold text-white"
                      disabled={busyId === row.threadId}
                      onClick={() => void assign(row.threadId)}
                    >
                      Accept
                    </button>
                  ) : null}
                  <a
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800"
                    href={`/orbit/beyond-master/conversations?id=${encodeURIComponent(row.threadId)}`}
                  >
                    Open transcript
                  </a>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800"
                    onClick={() => setReplyThread(row.threadId)}
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800"
                    onClick={() => setLinkThread(row.threadId)}
                  >
                    Link ticket
                  </button>
                </div>
              </div>
              {row.assigned ? (
                <p className="mt-2 text-xs text-slate-600">
                  Assigned: {row.assigned.displayName}
                </p>
              ) : null}
              {replyThread === row.threadId ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="w-full rounded-xl border border-slate-200 p-2 text-sm"
                    rows={3}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Message to customer (shown in their chat history)"
                  />
                  <button
                    type="button"
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
                    disabled={busyId === row.threadId}
                    onClick={() => void sendReply()}
                  >
                    Send
                  </button>
                </div>
              ) : null}
              {linkThread === row.threadId ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className="rounded-xl border border-slate-200 px-2 py-1 text-sm"
                    placeholder="BM-12345"
                    value={linkRef}
                    onChange={(e) => setLinkRef(e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
                    disabled={busyId === row.threadId}
                    onClick={() => void linkTicket()}
                  >
                    Save link
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
