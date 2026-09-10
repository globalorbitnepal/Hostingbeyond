"use client";

import { useEffect, useState } from "react";

import { readResponseError } from "@/lib/orbit/read-response-error";

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onCommit?: (url: string) => void;
  onDelete?: () => void;
};

type LibraryAsset = {
  id: string;
  url: string;
  originalName: string;
  source?: "upload" | "site";
};

export function OrbitImageField({
  label,
  value,
  onChange,
  onCommit,
  onDelete,
}: ImageFieldProps) {
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
    setStatus(`Uploading ${file.name} (${(file.size / 1024).toFixed(1)} KB)…`);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("alt", label);
      const res = await fetch("/api/orbit/media", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Upload failed");
        setStatus("");
        setError(parsed.text);
        return;
      }
      const json = (await res.json()) as {
        error?: string;
        details?: string;
        asset?: { url: string };
      };
      if (!json.asset?.url) {
        setStatus("");
        setError(
          [json.error || "Upload did not return an image URL.", json.details]
            .filter(Boolean)
            .join("\n"),
        );
        return;
      }
      commit(json.asset.url);
      setStatus(`Saved: ${json.asset.url}`);
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
          const parsed = await readResponseError(res, "Could not load media library");
          if (!cancelled) setLibraryError(parsed.text);
          return;
        }
        const json = (await res.json()) as { assets?: LibraryAsset[] };
        if (!cancelled) setLibrary(json.assets ?? []);
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
      {value ? (
        <div className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
          {/* Native img so runtime /uploads files preview without next/image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-full w-full object-contain p-2"
          />
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
          No image
        </div>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onCommit?.(event.target.value)}
        placeholder="/uploads/… or /images/…"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--hb-blue)]/40"
      />
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--hb-blue)]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--hb-blue)]">
          {uploading
            ? "Uploading…"
            : value
              ? "Change image"
              : "Upload image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
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
        {value ? (
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
            Replace image
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
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
        ) : null}
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
              setStatus("Image cleared from this field. File kept in Media Library.");
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
          >
            Clear field
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              onDelete();
            }}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            Delete image
          </button>
        ) : null}
      </div>
      {status ? <p className="text-xs text-emerald-700">{status}</p> : null}
      {error ? (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </pre>
      ) : null}
      {libraryOpen ? (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2">
          <input
            value={libraryQuery}
            onChange={(event) => setLibraryQuery(event.target.value)}
            placeholder="Search site and uploaded images"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
          />
          {libraryError ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {libraryError}
            </pre>
          ) : null}
          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt=""
                  className="h-16 w-full object-cover"
                />
                <span className="block truncate px-1 py-1 text-[10px] text-slate-500">
                  {asset.source === "site" ? "Site" : "Upload"} · {asset.originalName}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
