"use client";

import { useState } from "react";

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
};

export function OrbitImageField({ label, value, onChange }: ImageFieldProps) {
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
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-semibold tracking-wide text-[var(--hb-muted)] uppercase">
        {label}
      </p>
      {value ? (
        <div className="relative h-28 w-full overflow-hidden rounded-lg border border-white/10 bg-black/40">
          {/* Native img so runtime /uploads files preview without next/image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-full w-full object-contain p-2"
          />
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-white/15 text-xs text-white/40">
          No image
        </div>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/uploads/… or https://…"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--hb-blue)]/40"
      />
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--hb-blue)]/40 px-3 py-1.5 text-xs font-semibold text-[#9ad0ff]">
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
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
          <button
            type="button"
            onClick={() => {
              onChange("");
              setStatus("Cleared from this field (file kept in Media Library)");
            }}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:text-white"
          >
            Clear field
          </button>
        ) : null}
      </div>
      {status ? <p className="text-[11px] text-white/45">{status}</p> : null}
    </div>
  );
}
