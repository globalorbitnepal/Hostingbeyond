"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, RefreshCw, Search, Trash2 } from "lucide-react";

import { readResponseError } from "@/lib/orbit/read-response-error";

type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  topic: string;
  company: string | null;
  message: string;
};

export function OrbitContactInquiriesAdmin() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orbit/contact-inquiries");
      if (!res.ok) {
        const parsed = await readResponseError(
          res,
          "Could not load inquiries.",
        );
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { inquiries?: Inquiry[] };
      setRows(json.inquiries ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load inquiries.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.name, row.email, row.company ?? "", row.topic, row.message]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [rows, q]);

  async function remove(id: string) {
    const res = await fetch("/api/orbit/contact-inquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const parsed = await readResponseError(res, "Delete failed");
      setError(parsed.text);
      return;
    }
    setRows((current) => current.filter((row) => row.id !== id));
    setActiveId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forms</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Messages sent through the public contact form. Each submission is
            stored with the topic, company and message so sales can reply from
            their own mailbox.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <label className="relative block w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, or message…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-10 text-sm"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Mail className="mx-auto size-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {rows.length === 0 ? "No submissions yet." : "No matches."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Messages appear here as soon as someone uses the contact form.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {filtered.map((row) => {
          const open = activeId === row.id;
          return (
            <article
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setActiveId(open ? null : row.id)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="font-semibold text-slate-900">{row.name}</span>
                <span className="text-xs font-semibold text-slate-500">
                  {row.topic}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {row.email}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(row.createdAt).toLocaleString()}
                </span>
              </button>
              {open ? (
                <div className="border-t border-slate-100 px-4 py-3">
                  {row.company ? (
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      {row.company}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                    {row.message}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${row.email}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      Reply by email
                    </a>
                    <button
                      type="button"
                      onClick={() => void remove(row.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
