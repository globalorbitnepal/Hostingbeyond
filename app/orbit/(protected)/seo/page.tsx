"use client";

import { useEffect, useState } from "react";

import type { CmsSiteSettings } from "@/lib/orbit/defaults";

export default function OrbitSeoPage() {
  const [settings, setSettings] = useState<CmsSiteSettings | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/settings");
      const json = await res.json();
      if (res.ok) setSettings(json.settings);
    })();
  }, []);

  async function save() {
    if (!settings) return;
    const res = await fetch("/api/orbit/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setStatus(res.ok ? "SEO settings saved" : "Save failed");
  }

  if (!settings)
    return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO</h1>
          <p className="mt-1 text-sm text-slate-500">
            Default metadata and Open Graph defaults.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold text-white"
        >
          Save
        </button>
      </div>
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
        {(
          [
            ["name", "Site name"],
            ["tagline", "Tagline"],
            ["description", "Meta description"],
            ["url", "Canonical base URL"],
            ["twitterHandle", "Twitter handle"],
            ["ogImagePath", "Default OG image path"],
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
    </div>
  );
}
