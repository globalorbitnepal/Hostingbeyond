"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

import { readResponseError } from "@/lib/orbit/read-response-error";
import type { WebsiteLanguageStatus } from "@/lib/i18n/website-languages";

type TranslationStatus = {
  enabledFlag: boolean;
  projectId: string;
  credentialsPathConfigured: boolean;
  credentialsFilePresent: boolean;
  adapterEnabled: boolean;
  liveTranslationVerified: boolean;
};

type Payload = {
  languages: WebsiteLanguageStatus[];
  total: number;
  enabledCount: number;
  defaultLanguage: string;
  translation: TranslationStatus;
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={
        ok
          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
          : "rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
      }
    >
      {label}
    </span>
  );
}

export default function OrbitLanguagesPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/languages");
      if (!res.ok) {
        const parsed = await readResponseError(res, "Could not load languages");
        setStatus(parsed.text);
        return;
      }
      const json = (await res.json()) as Payload;
      setData(json);
      setDraft(
        json.languages.filter((row) => row.enabled).map((row) => row.code),
      );
    })();
  }, []);

  async function save() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/orbit/languages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabledCodes: draft }),
    });
    setBusy(false);
    if (!res.ok) {
      const parsed = await readResponseError(res, "Save failed");
      setStatus(parsed.text);
      return;
    }
    const json = (await res.json()) as {
      languages?: WebsiteLanguageStatus[];
      enabledCount?: number;
    };
    if (json.languages && data) {
      setData({
        ...data,
        languages: json.languages,
        enabledCount:
          json.enabledCount ?? json.languages.filter((r) => r.enabled).length,
      });
      setDraft(
        json.languages.filter((row) => row.enabled).map((row) => row.code),
      );
    }
    setStatus(
      "Language availability saved. Public selector updates after refresh.",
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-slate-500">{status || "Loading languages…"}</p>
    );
  }

  const t = data.translation;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Languages className="size-6 text-indigo-700" aria-hidden />
            Languages &amp; Translation
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Enable storefront languages independently of country and currency.
            English stays the source. Cloud Translation is not marked live until
            an authorized translate request succeeds.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Save language availability
        </button>
      </div>

      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Registered
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Enabled
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {data.enabledCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Default
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {data.defaultLanguage}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Translation
          </p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <StatusPill
              ok={t.enabledFlag}
              label={t.enabledFlag ? "Flag on" : "Flag off"}
            />
            <StatusPill
              ok={t.credentialsFilePresent}
              label={
                t.credentialsFilePresent
                  ? "Key file present"
                  : "Key file missing"
              }
            />
            <StatusPill
              ok={t.liveTranslationVerified}
              label="Live request not verified"
            />
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <p>
          Project <span className="font-semibold">{t.projectId}</span>. Adapter
          enabled: {t.adapterEnabled ? "yes" : "no"}. Path configured:{" "}
          {t.credentialsPathConfigured ? "yes" : "no"}. These indicators are not
          a successful Cloud Translation call.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Enabled</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">English name</th>
              <th className="px-4 py-3">Native name</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {data.languages.map((row) => {
              const checked = draft.includes(row.code);
              return (
                <tr
                  key={row.code}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={row.isDefault}
                      aria-label={`Enable ${row.englishName}`}
                      onChange={(e) => {
                        if (row.isDefault) return;
                        setDraft((current) => {
                          if (e.target.checked) {
                            return [...new Set([...current, row.code])];
                          }
                          return current.filter((code) => code !== row.code);
                        });
                      }}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold">
                    {row.code}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    {row.englishName}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {row.nativeName}
                  </td>
                  <td className="px-4 py-2.5">
                    {row.isDefault ? (
                      <span className="text-[11px] font-semibold text-indigo-700">
                        Source
                      </span>
                    ) : checked ? (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Enabled
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Disabled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
