"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

type Log = {
  id: string;
  action: string;
  resource: string | null;
  details: string | null;
  createdAt: string;
};

export default function OrbitActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orbit/activity");
      if (!res.ok) throw new Error("Could not load the activity log.");
      const json = (await res.json()) as { logs?: Log[] };
      setLogs(json.logs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return logs;
    return logs.filter((log) =>
      [log.action, log.resource ?? "", log.details ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [logs, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="mt-1 text-sm text-slate-500">
            Security and content actions for Orbit Super Admin.
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
          placeholder="Search action, resource, or details…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-10 text-sm"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="hidden px-4 py-3 md:table-cell">Details</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading activity…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  {logs.length === 0
                    ? "No activity recorded yet."
                    : "No matches."}
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {log.resource || "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {log.details || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
