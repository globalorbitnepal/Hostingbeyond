"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type {
  BeyondMasterOverview,
  ModuleStatus,
  OverviewUsage,
} from "@/lib/beyond-master/overview";

const badgeClass: Record<ModuleStatus, string> = {
  Available: "bg-emerald-50 text-emerald-800",
  Configured: "bg-emerald-50 text-emerald-800",
  "Read-only": "bg-indigo-50 text-indigo-800",
  "Migration Pending": "bg-amber-50 text-amber-900",
  "Not Configured": "bg-rose-50 text-rose-800",
  "Coming Later": "bg-slate-100 text-slate-600",
};

export default function OrbitBeyondMasterPage() {
  const [overview, setOverview] = useState<BeyondMasterOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/orbit/beyond-master/overview");
        const payload = (await response.json().catch(() => null)) as
          (BeyondMasterOverview & { error?: string }) | null;
        if (cancelled) return;
        if (!response.ok || !payload || payload.readOnly !== true) {
          setError(
            payload?.error || "The Beyond Master overview could not be loaded.",
          );
          setOverview(null);
          return;
        }
        setOverview(payload);
        setError("");
      } catch {
        if (!cancelled)
          setError("The Beyond Master overview could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Beyond Master AI
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Read-only overview. Nothing on this screen changes provider settings,
          tickets, or DNS.
        </p>
        <Link
          href="/orbit/beyond-master/usage"
          className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Usage analytics
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" role="status">
          Loading the Beyond Master overview…
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

      {overview ? <OverviewBody overview={overview} /> : null}
    </div>
  );
}

function OverviewBody({ overview }: { overview: BeyondMasterOverview }) {
  const fields = [
    ["Provider", overview.ai.provider],
    ["Model", overview.ai.model],
    ["Provider host", overview.ai.host],
    ["API key configured", overview.ai.apiKeyConfigured],
    ["Request timeout", `${overview.ai.timeoutMs} ms`],
    ["Rate limit", overview.ai.rateLimit],
  ] as const;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">AI status</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs tracking-wide text-slate-500 uppercase">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900">System modules</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {overview.modules.map((module) => (
            <article
              key={module.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {module.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass[module.status]}`}
                >
                  {module.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{module.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Usage summary</h2>
        {overview.usage.available ? (
          <UsageGrid usage={overview.usage} />
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            {overview.usage.message}
          </p>
        )}
      </section>

      <p className="text-sm text-slate-500">{overview.note}</p>
    </>
  );
}

function UsageGrid({
  usage,
}: {
  usage: Extract<OverviewUsage, { available: true }>;
}) {
  const cards = [
    ["Total requests", String(usage.totalRequests)],
    ["Successful requests", String(usage.successfulRequests)],
    ["Failed requests", String(usage.failedRequests)],
    ["Account reads", String(usage.accountReads)],
    [
      "Average latency",
      usage.averageLatencyMs == null
        ? "Not stored"
        : `${Math.round(usage.averageLatencyMs)} ms`,
    ],
    [
      "DNS operations",
      usage.dnsOperations == null ? "Unavailable" : String(usage.dnsOperations),
    ],
  ];
  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <p className="text-xs tracking-wide text-slate-500 uppercase">
              {label}
            </p>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      {usage.dnsMessage ? (
        <p className="mt-3 text-sm text-slate-600">{usage.dnsMessage}</p>
      ) : null}
      <h3 className="mt-5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Provider usage
      </h3>
      {usage.providers.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No provider rows are stored.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {usage.providers.map((row) => (
            <li
              key={row.provider}
              className="flex items-center justify-between text-sm"
            >
              <span>{row.provider}</span>
              <span className="font-semibold">{row.requests}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
