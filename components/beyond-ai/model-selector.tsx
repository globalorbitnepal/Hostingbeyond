"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

import type { BeyondAiModelConfig } from "@/config/beyond-ai-product";
import { cn } from "@/lib/utils";

function ProviderMark({ id }: { id: string }) {
  const letter = id.slice(0, 1).toUpperCase();
  return (
    <span
      className="inline-flex size-9 items-center justify-center rounded-xl bg-[#f4f0ff] text-[13px] font-extrabold text-[#673de6]"
      aria-hidden
    >
      {letter}
    </span>
  );
}

export function ModelSelector({
  selectedId,
  onSelect,
  compact,
  showEstimate,
}: {
  selectedId?: string;
  onSelect?: (model: BeyondAiModelConfig) => void;
  compact?: boolean;
  showEstimate?: boolean;
}) {
  const [models, setModels] = useState<BeyondAiModelConfig[]>([]);
  const [moreLabel, setMoreLabel] = useState("+ More models");
  const [active, setActive] = useState(selectedId ?? "claude");

  useEffect(() => {
    void fetch("/api/beyond-ai/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) setModels(data.models);
        if (data.moreLabel) setMoreLabel(data.moreLabel);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (selectedId) setActive(selectedId);
  }, [selectedId]);

  const pick = (m: BeyondAiModelConfig) => {
    setActive(m.id);
    onSelect?.(m);
  };

  if (!models.length) return null;

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-3")}>
      <p
        className={cn(
          "font-bold tracking-wide text-[#64748b] uppercase",
          compact ? "text-[11px]" : "text-[12px]",
        )}
      >
        Choose your AI model
      </p>
      <div
        className={cn(
          "flex gap-2",
          compact
            ? "[scrollbar-width:none] overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            : "grid sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {models.map((m) => {
          const selected = active === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => pick(m)}
              className={cn(
                "shrink-0 rounded-[18px] border p-3 text-left transition duration-200",
                compact ? "min-w-[140px]" : "",
                selected
                  ? "border-[#673de6] bg-[#f4f0ff] shadow-[0_12px_28px_-16px_rgba(103,61,230,0.45)]"
                  : "border-[#e9e4ff] bg-white hover:border-[#c4b5fd]",
              )}
            >
              <div className="flex items-center gap-2.5">
                <ProviderMark id={m.id} />
                <div className="min-w-0">
                  <p className="text-[14px] font-extrabold text-[#2f1c6a]">
                    {m.shortLabel}
                  </p>
                  <p className="text-[11px] font-medium text-[#64748b]">
                    {m.capability}
                  </p>
                </div>
              </div>
              {showEstimate && selected ? (
                <p className="mt-2 text-[11px] font-semibold text-[#673de6]">
                  Est. ~${m.estimatedRequestUsd.toFixed(2)} / generation
                </p>
              ) : null}
            </button>
          );
        })}
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-[18px] border border-dashed border-[#c4b5fd] bg-white/60 px-4",
            compact ? "min-w-[120px]" : "",
          )}
        >
          <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#673de6]">
            <Sparkles className="size-4" aria-hidden />
            {moreLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ModelDropdown({
  value,
  onChange,
  models,
}: {
  value: string;
  onChange: (id: string) => void;
  models: BeyondAiModelConfig[];
}) {
  const current = models.find((m) => m.id === value) ?? models[0];
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-white/60 uppercase">
        Model
      </span>
      <div className="relative mt-1">
        <select
          value={current?.id ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-white/20 bg-white/10 pr-8 pl-3 text-[13px] font-semibold text-white outline-none"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} className="text-[#0f172a]">
              {m.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-white/70"
          aria-hidden
        />
      </div>
    </label>
  );
}
