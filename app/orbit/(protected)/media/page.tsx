"use client";

import { useEffect, useState } from "react";

type Asset = {
  id: string;
  url: string;
  filename?: string;
  originalName: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
};

export default function OrbitMediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [q, setQ] = useState("");
  const [alt, setAlt] = useState("");
  const [status, setStatus] = useState("");

  async function load(query = q) {
    const res = await fetch(`/api/orbit/media?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    if (res.ok) setAssets(json.assets ?? []);
    else setStatus(json.error || "Failed to load media");
  }

  useEffect(() => {
    void load("");
    // Initial library load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUpload(file: File | null, input: HTMLInputElement) {
    if (!file) return;
    setStatus("Uploading…");
    const form = new FormData();
    form.set("file", file);
    form.set("alt", alt);
    const res = await fetch("/api/orbit/media", { method: "POST", body: form });
    const json = await res.json();
    input.value = "";
    if (!res.ok) {
      setStatus(json.error || "Upload failed");
      return;
    }
    setAlt("");
    setStatus("Uploaded — file is kept permanently");
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="mt-1 text-sm text-[var(--hb-muted)]">
          All uploaded images stay here permanently. Replace a field anytime —
          the old file is never deleted.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text"
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none"
          />
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--hb-blue)]/40 px-4 py-2.5 text-sm font-semibold text-[#9ad0ff]">
            Upload image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={(e) =>
                void onUpload(e.target.files?.[0] ?? null, e.currentTarget)
              }
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm"
          >
            Refresh
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search media"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void load(q)}
            className="rounded-xl bg-white/10 px-4 text-sm"
          >
            Search
          </button>
        </div>
        {status ? (
          <p className="mt-3 text-sm text-emerald-300">{status}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.url}
              alt={asset.alt || asset.originalName}
              className="h-40 w-full object-cover"
            />
            <div className="space-y-2 p-3">
              <p className="truncate text-sm font-medium">
                {asset.originalName}
              </p>
              <p className="truncate text-[11px] text-white/40">{asset.url}</p>
              <p className="text-xs text-[var(--hb-muted)]">
                {(asset.size / 1024).toFixed(1)} KB · {asset.mimeType}
              </p>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-2 py-1 text-xs"
                onClick={() => void navigator.clipboard.writeText(asset.url)}
              >
                Copy URL
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
