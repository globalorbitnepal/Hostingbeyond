"use client";

import { useState } from "react";

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onDelete?: () => void;
};

export function OrbitImageField({
  label,
  value,
  onChange,
  onDelete,
}: ImageFieldProps) {
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function onUpload(file: File | null, input: HTMLInputElement) {
    if (!file) return;
    setUploading(true);
    setStatus("Uploading…");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("alt", label);
      const res = await fetch("/api/orbit/media", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        error?: string;
        asset?: { url: string };
      };
      if (!res.ok || !json.asset?.url) {
        setStatus(json.error || "Upload failed");
        return;
      }
      onChange(json.asset.url);
      setStatus("Uploaded");
    } catch {
      setStatus("Upload failed");
    } finally {
      input.value = "";
      setUploading(false);
    }
  }

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
        placeholder="/uploads/… or https://…"
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
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
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
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
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
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setStatus("Cleared from this field (file kept in Media Library)");
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
          >
            Clear field
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            Delete image
          </button>
        ) : null}
      </div>
      {status ? <p className="text-[11px] text-slate-500">{status}</p> : null}
    </div>
  );
}
