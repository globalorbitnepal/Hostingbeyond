"use client";

import { useEffect, useState } from "react";

import type { OperatorFeatureKey } from "@/lib/beyond-master/operator-features";

type Commerce = {
  commerceEnabled: boolean;
  capabilities: { id: string; envName: string; enabled: boolean }[];
};

type Payload = {
  features: Record<OperatorFeatureKey, boolean>;
  labels: Record<OperatorFeatureKey, string>;
  commerce: Commerce;
  commerceNote: string;
  error?: string;
};

type Usage = {
  provider: string | null;
  model: string | null;
  credentialsPresent: boolean;
  monthKey: string;
  billingPlan: "google_ai_studio_free" | "paid_app_cap";
  paidBudgetEnabled: boolean;
  billedCents: number;
  applicationCapCents: number;
  applicationSpentCents: number;
  applicationReservedCents: number;
  applicationRemainingCents: number;
  appRateLimit: string;
  published: { planName: string; rpm: number; rpd: number; tpm: number };
  today: {
    geminiRequests: number;
    geminiSuccess: number;
    geminiRateLimited: number;
    geminiErrors: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  lastMinute: { geminiRequests: number };
  note: string;
  error?: string;
};

function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function bar(used: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

export default function OrbitBeyondMasterControlsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const [featRes, useRes] = await Promise.all([
      fetch("/api/orbit/beyond-master/features", { cache: "no-store" }),
      fetch("/api/orbit/beyond-master/gemini-usage", { cache: "no-store" }),
    ]);
    const feat = (await featRes.json()) as Payload;
    const use = (await useRes.json()) as Usage;
    if (!featRes.ok) throw new Error(feat.error || "Could not load features.");
    if (!useRes.ok)
      throw new Error(use.error || "Could not load Gemini usage.");
    setData(feat);
    setUsage(use);
  }

  useEffect(() => {
    let cancelled = false;
    void load()
      .then(() => {
        if (!cancelled) setError("");
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not load.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(key: OperatorFeatureKey, value: boolean) {
    setSaving(key);
    try {
      const res = await fetch("/api/orbit/beyond-master/features", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const payload = (await res.json()) as Payload;
      if (!res.ok) throw new Error(payload.error || "Save failed.");
      setData((prev) =>
        prev ? { ...prev, features: payload.features } : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  const rpd = usage ? bar(usage.today.geminiRequests, usage.published.rpd) : 0;
  const rpm = usage
    ? bar(usage.lastMinute.geminiRequests, usage.published.rpm)
    : 0;
  const tpm = usage ? bar(usage.today.totalTokens, usage.published.tpm) : 0;
  const cap = usage?.paidBudgetEnabled
    ? bar(
        usage.applicationSpentCents + usage.applicationReservedCents,
        usage.applicationCapCents,
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Gemini usage and feature controls
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live recorded Gemini traffic plus on/off switches for assistant
          features. Commerce writes stay env-gated.
        </p>
      </div>
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {usage ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Gemini free-plan usage (recorded)
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Provider" value={usage.provider ?? "Not configured"} />
            <Stat label="Model" value={usage.model ?? "Not configured"} />
            <Stat
              label="API key"
              value={usage.credentialsPresent ? "Configured" : "Missing"}
            />
            <Stat label="App rate limit" value={usage.appRateLimit} />
          </dl>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Meter
              label={`Today vs published RPD (${usage.published.rpd})`}
              value={`${usage.today.geminiRequests} / ${usage.published.rpd}`}
              pct={rpd}
            />
            <Meter
              label={`Last 60s vs published RPM (${usage.published.rpm})`}
              value={`${usage.lastMinute.geminiRequests} / ${usage.published.rpm}`}
              pct={rpm}
            />
            <Meter
              label={`Today tokens vs published TPM (${usage.published.tpm.toLocaleString()})`}
              value={`${usage.today.totalTokens.toLocaleString()} tokens`}
              pct={tpm}
            />
            <Meter
              label={
                usage.paidBudgetEnabled
                  ? `App monthly cap ${usd(usage.applicationCapCents)} (${usage.monthKey})`
                  : `Billing plan (${usage.monthKey})`
              }
              value={
                usage.paidBudgetEnabled
                  ? `${usd(usage.applicationSpentCents + usage.applicationReservedCents)} used · ${usd(usage.applicationRemainingCents)} left`
                  : "Google AI Studio free · $0.00 billed"
              }
              pct={cap}
            />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Today: {usage.today.geminiSuccess} successful,{" "}
            {usage.today.geminiRateLimited} rate-limited,{" "}
            {usage.today.geminiErrors} other · prompt{" "}
            {usage.today.promptTokens.toLocaleString()} / completion{" "}
            {usage.today.completionTokens.toLocaleString()}.
          </p>
          <p className="mt-2 text-xs text-slate-500">{usage.note}</p>
        </section>
      ) : null}

      {data ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Assistant features
            </h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {(Object.keys(data.features) as OperatorFeatureKey[]).map(
                (key) => (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-800">
                      {data.labels[key]}
                    </span>
                    <button
                      type="button"
                      disabled={saving === key}
                      onClick={() => toggle(key, !data.features[key])}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        data.features[key]
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {data.features[key] ? "On" : "Off"}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Commerce and writes (server env)
            </h2>
            <p className="mt-2 text-sm text-slate-600">{data.commerceNote}</p>
            <p className="mt-2 text-sm">
              Global commerce gate:{" "}
              <strong>
                {data.commerce.commerceEnabled ? "enabled" : "disabled"}
              </strong>
            </p>
            <ul className="mt-3 text-sm text-slate-700">
              {data.commerce.capabilities.map((row) => (
                <li key={row.id}>
                  {row.id}: {row.enabled ? "on" : "off"}{" "}
                  <span className="text-slate-400">({row.envName})</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : !error ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function Meter({
  label,
  value,
  pct,
}: {
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
