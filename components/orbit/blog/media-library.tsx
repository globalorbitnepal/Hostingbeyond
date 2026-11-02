"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, RefreshCw, Search, Upload } from "lucide-react";

import { readResponseError } from "@/lib/orbit/read-response-error";
import { uploadOrbitFile } from "@/lib/orbit/upload-orbit-file";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  url: string;
  filename?: string;
  originalName: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
  source?: "upload" | "site";
};

export function OrbitMediaLibrary({
  heading = "Media library",
  description = "Every image uploaded for articles, pages and products.",
}: {
  heading?: string;
  description?: string;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [q, setQ] = useState("");
  const [alt, setAlt] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async (query = "") => {
    const res = await fetch(`/api/orbit/media?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      const parsed = await readResponseError(res, "Failed to load media");
      setStatus(parsed.text);
      return;
    }
    const json = await res.json();
    setAssets(json.assets ?? []);
  }, []);

  useEffect(() => {
    void load("");
  }, [load]);

  async function onUpload(file: File | null, input: HTMLInputElement) {
    if (!file) return;
    setBusy(true);
    setStatus("Uploading…");
    try {
      await uploadOrbitFile(file, alt);
      input.value = "";
      setAlt("");
      setStatus("Uploaded — the file is stored permanently.");
      await load(q);
    } catch (caught) {
      input.value = "";
      setStatus(caught instanceof Error ? caught.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d2327]">
          {heading}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text for the next upload (describe the image)"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          />
          <label
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#2271b1] px-4 py-2.5 text-sm font-semibold text-white",
              busy && "cursor-wait opacity-60",
            )}
          >
            <Upload className="size-4" />
            {busy ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
              className="hidden"
              disabled={busy}
              onChange={(e) =>
                void onUpload(e.target.files?.[0] ?? null, e.currentTarget)
              }
            />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(q);
              }}
              placeholder="Search by file name or alt text"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => void load(q)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          >
            <RefreshCw className="size-4" /> Refresh
          </button>
        </div>
        {status ? (
          <p
            className={cn(
              "mt-3 text-sm whitespace-pre-wrap",
              /fail|error|could not/i.test(status)
                ? "text-red-600"
                : "text-emerald-700",
            )}
          >
            {status}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            {asset.mimeType.startsWith("video/") ? (
              <video
                src={asset.url}
                className="h-40 w-full object-cover"
                muted
                playsInline
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={asset.url}
                alt={asset.alt || asset.originalName}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            )}
            <div className="space-y-2 p-3">
              <p className="truncate text-sm font-medium">
                {asset.source === "site" ? "Site · " : "Upload · "}
                {asset.originalName}
              </p>
              <p className="truncate text-[11px] text-slate-400">{asset.url}</p>
              <p className="text-xs text-slate-500">
                {(asset.size / 1024).toFixed(1)} KB · {asset.mimeType}
              </p>
              <button
                type="button"
                onClick={() => void copy(asset.url)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-[#2271b1] hover:text-[#2271b1]"
              >
                {copied === asset.url ? (
                  <>
                    <Check className="size-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy URL
                  </>
                )}
              </button>
            </div>
          </article>
        ))}
        {assets.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
            No media yet. Upload an image to use it as a cover or inside an
            article.
          </p>
        ) : null}
      </div>
    </div>
  );
}
