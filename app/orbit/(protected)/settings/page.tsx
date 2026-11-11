"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { OrbitImageField } from "@/components/orbit/image-field";
import type { CmsSiteSettings } from "@/lib/orbit/defaults";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitSettingsPage() {
  const [settings, setSettings] = useState<CmsSiteSettings | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/orbit/settings");
        if (!res.ok) {
          const parsed = await readResponseError(
            res,
            "Could not load settings.",
          );
          throw new Error(parsed.text);
        }
        const json = (await res.json()) as { settings?: CmsSiteSettings };
        if (!cancelled) setSettings(json.settings ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load settings.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const res = await fetch("/api/orbit/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { settings?: CmsSiteSettings };
      if (json.settings) setSettings(json.settings);
      setStatus("Settings saved — live on the public site.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading settings…</p>;
  }

  if (!settings) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error || "Settings could not be loaded."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <RefreshCw className="size-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Brand, contact, and CTA defaults.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {status ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-sm text-indigo-950">
        Display currency rates (INR, NPR, EUR, …) are managed under{" "}
        <Link
          href="/orbit/currency-rates"
          className="font-semibold text-indigo-700 underline"
        >
          Currency &amp; FX
        </Link>{" "}
        in the left menu — including live market refresh.
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 p-5 md:grid-cols-2">
        <OrbitImageField
          label="Site logo"
          value={settings.logoPath}
          onChange={(url) => setSettings({ ...settings, logoPath: url })}
        />
        <OrbitImageField
          label="Share / OG image"
          value={settings.ogImagePath}
          onChange={(url) => setSettings({ ...settings, ogImagePath: url })}
        />
        {(
          [
            ["loginLabel", "Login label"],
            ["loginHref", "Login href"],
            ["getStartedLabel", "Get Started label"],
            ["getStartedHref", "Get Started href"],
            ["contactEmail", "Contact email"],
            ["contactPhone", "Contact phone"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-xs text-slate-500 uppercase">
            {label}
            <input
              value={String(settings[key] ?? "")}
              onChange={(e) =>
                setSettings({ ...settings, [key]: e.target.value })
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 normal-case"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-sm font-bold text-slate-900">
            Customer panel — Trustpilot
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Leave the URL empty until the Trustpilot page is ready. When you
            save an https link, a reviews card appears at the bottom of the
            customer sidebar (Hostinger-style feedback slot).
          </p>
        </div>
        <label className="text-xs text-slate-500 uppercase">
          Trustpilot URL
          <input
            value={settings.trustpilotUrl ?? ""}
            onChange={(e) =>
              setSettings({ ...settings, trustpilotUrl: e.target.value })
            }
            placeholder="https://www.trustpilot.com/review/…"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 normal-case"
          />
        </label>
        <label className="text-xs text-slate-500 uppercase">
          Sidebar label
          <input
            value={settings.trustpilotLabel ?? ""}
            onChange={(e) =>
              setSettings({ ...settings, trustpilotLabel: e.target.value })
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 normal-case"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900/90">
        Orbit opens with the server-side access key. The key is verified on the
        server and is not stored in the browser after login.
      </div>
    </div>
  );
}
