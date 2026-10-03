"use client";

import { useEffect, useState } from "react";

import { readResponseError } from "@/lib/orbit/read-response-error";
import { uploadOrbitFile } from "@/lib/orbit/upload-orbit-file";

type VideoFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onCommit?: (url: string) => void;
};

type LibraryAsset = {
  id: string;
  url: string;
  originalName: string;
  source?: "upload" | "site";
};

function isVideoUrl(url: string) {
  return /\.(mp4|webm)(\?|#|$)/i.test(url.trim());
}

export function OrbitVideoField({
  label,
  value,
  onChange,
  onCommit,
}: VideoFieldProps) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState<LibraryAsset[]>([]);
  const [libraryError, setLibraryError] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");

  function commit(url: string) {
    onChange(url);
    onCommit?.(url);
  }

  async function onUpload(file: File | null, input: HTMLInputElement) {
    if (!file) return;
    setUploading(true);
    setError("");
    setStatus(`Uploading ${file.name}…`);
    try {
      const url = await uploadOrbitFile(file, label);
      commit(url);
      setStatus(`Saved: ${url}`);
    } catch (caught) {
      setStatus("");
      setError(
        caught instanceof Error
          ? `Upload failed: ${caught.message}`
          : "Upload failed. Check the network connection and try again.",
      );
    } finally {
      input.value = "";
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!libraryOpen) return;
    let cancelled = false;
    void (async () => {
      setLibraryError("");
      try {
        const res = await fetch(
          `/api/orbit/media?q=${encodeURIComponent(libraryQuery)}`,
        );
        if (!res.ok) {
          const parsed = await readResponseError(
            res,
            "Could not load media library",
          );
          if (!cancelled) setLibraryError(parsed.text);
          return;
        }
        const json = (await res.json()) as { assets?: LibraryAsset[] };
        const assets = (json.assets ?? []).filter((asset) =>
          isVideoUrl(asset.url),
        );
        if (!cancelled) setLibrary(assets);
      } catch (caught) {
        if (!cancelled) {
          setLibraryError(
            caught instanceof Error
              ? caught.message
              : "Could not load media library",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [libraryOpen, libraryQuery]);

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      {value && isVideoUrl(value) ? (
        <div className="relative h-36 w-full overflow-hidden rounded-lg border border-slate-200 bg-black">
          <video
            src={value}
            className="h-full w-full object-cover"
            muted
            playsInline
            loop
            autoPlay
          />
        </div>
      ) : value ? (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-amber-200 bg-amber-50 text-xs text-amber-800">
          URL is set but is not an MP4/WebM path.
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
          No video — static image or built-in art shows instead
        </div>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onCommit?.(event.target.value)}
        placeholder="/images/domains/videos/… or /uploads/…"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--hb-blue)]/40"
      />
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--hb-blue)]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--hb-blue)]">
          {uploading
            ? "Uploading…"
            : value
              ? "Change video"
              : "Upload MP4/WebM"}
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            disabled={uploading}
            onChange={(event) =>
              void onUpload(
                event.target.files?.[0] ?? null,
                event.currentTarget,
              )
            }
          />
        </label>
        <button
          type="button"
          onClick={() => setLibraryOpen((open) => !open)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          {libraryOpen ? "Hide library" : "Choose from library"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => {
              commit("");
              setError("");
              setStatus("Video cleared from this field.");
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
          >
            Clear field
          </button>
        ) : null}
      </div>
      {status ? <p className="text-xs text-emerald-700">{status}</p> : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {libraryOpen ? (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2">
          <input
            value={libraryQuery}
            onChange={(event) => setLibraryQuery(event.target.value)}
            placeholder="Search uploaded videos"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
          />
          {libraryError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {libraryError}
            </p>
          ) : null}
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {library.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  commit(asset.url);
                  setLibraryOpen(false);
                  setStatus(`Selected ${asset.url}`);
                  setError("");
                }}
                className="overflow-hidden rounded-lg border border-slate-200 text-left hover:border-[var(--hb-blue)]"
                title={asset.url}
              >
                <video
                  src={asset.url}
                  className="h-16 w-full object-cover"
                  muted
                  playsInline
                />
                <span className="block truncate px-1 py-1 text-[10px] text-slate-500">
                  {asset.originalName}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
