"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, alt: string) => void;
}) {
  const [assets, setAssets] = useState<
    { id: string; url: string; alt: string; originalName: string }[]
  >([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    void fetch(`/api/orbit/media?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((json) => setAssets(json.assets ?? []));
  }, [open, q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
    >
      <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold text-slate-900">Select media</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500"
          >
            Close
          </button>
        </div>
        <div className="p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search media"
            className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="overflow-hidden rounded-lg border border-slate-200 text-left hover:border-[#673de6]"
                onClick={() => {
                  onSelect(asset.url, asset.alt || asset.originalName);
                  onClose();
                }}
              >
                <div className="relative aspect-square bg-slate-50">
                  <Image
                    src={asset.url}
                    alt={asset.alt || asset.originalName}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                <p className="truncate p-1 text-[10px] text-slate-500">
                  {asset.originalName}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
