"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { routes } from "@/config/routes";

type Row = {
  domain: string;
  status: string;
  register: number | null;
};

export function PanelDomainFinder() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const search = useCallback(async (value: string) => {
    const q = value.trim();
    if (!q) return;
    setBusy(true);
    setError("");
    setNote("");
    setRows([]);
    try {
      const res = await fetch("/api/domains/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, scope: "primary" }),
      });
      const data = (await res.json()) as {
        error?: string;
        primary?: Row;
        results?: Row[];
      };
      if (!res.ok) {
        setError(data.error || "Search failed.");
        return;
      }
      const list = data.primary ? [data.primary] : (data.results ?? []);
      setRows(list.slice(0, 8));
    } catch {
      setError("Search failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (initial) void search(initial);
  }, [initial, search]);

  async function addToCart(domain: string) {
    setNote("");
    setError("");
    const res = await fetch("/api/domains/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || "Could not add this domain.");
      return;
    }
    router.push(routes.domainCart);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="hb-panel-hero">
        <h2 className="font-heading text-2xl font-bold">Register a domain</h2>
        <p className="mt-1 text-sm text-white/80">
          Live NameSilo availability. Checkout opens only after you add a name.
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void search(query);
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="yourbrand.com"
            className="hb-panel-search !pl-4"
          />
          <button
            type="submit"
            className="rounded-full bg-white px-4 text-sm font-bold text-violet-900"
            disabled={busy}
          >
            {busy ? "Searching" : "Search"}
          </button>
        </form>
      </section>
      {error ? (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}
      {note ? <p className="text-sm text-[var(--hb-p-muted)]">{note}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.domain}
            className="hb-panel-card flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-semibold">{row.domain}</p>
              <p className="text-xs text-[var(--hb-p-muted)]">
                {row.status}
                {row.register != null ? ` · $${row.register.toFixed(2)}` : ""}
              </p>
            </div>
            {row.status === "available" || row.status === "premium" ? (
              <button
                type="button"
                onClick={() => void addToCart(row.domain)}
                className="rounded-lg bg-[var(--hb-p-primary)] px-3 py-1.5 text-xs font-bold text-white"
              >
                Add and checkout
              </button>
            ) : (
              <span className="text-xs font-semibold text-[var(--hb-p-muted)]">
                Not available
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
