"use client";

import { useEffect, useState } from "react";

import type { CmsHomeSections } from "@/lib/orbit/defaults";

export default function OrbitNavigationPage() {
  const [sections, setSections] = useState<CmsHomeSections | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/home");
      const json = await res.json();
      if (res.ok) setSections(json.sections);
    })();
  }, []);

  async function save() {
    if (!sections) return;
    const res = await fetch("/api/orbit/content/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
    setStatus(res.ok ? "Navigation saved" : "Save failed");
  }

  if (!sections)
    return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Navigation</h1>
          <p className="mt-1 text-sm text-slate-500">
            Edit header menu labels and destinations.
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

      <div className="space-y-4">
        {sections.navigation.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs text-slate-500 uppercase">
                Label
                <input
                  value={item.label}
                  onChange={(e) => {
                    const navigation = [...sections.navigation];
                    navigation[index] = { ...item, label: e.target.value };
                    setSections({ ...sections, navigation });
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="text-xs text-slate-500 uppercase">
                Href
                <input
                  value={item.href}
                  onChange={(e) => {
                    const navigation = [...sections.navigation];
                    navigation[index] = { ...item, href: e.target.value };
                    setSections({ ...sections, navigation });
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
