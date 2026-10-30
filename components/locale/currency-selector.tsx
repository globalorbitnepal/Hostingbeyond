"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useLocale } from "@/components/locale/locale-provider";
import {
  orderedPublicDisplayCurrencies,
  publicCurrencyTriggerLabel,
  type PublicDisplayCurrency,
} from "@/lib/i18n/display-currencies";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  tone?: "dark" | "light";
  menuAlign?: "start" | "end";
  menuSide?: "below" | "above";
  className?: string;
};

export function CurrencySelector({
  compact = false,
  tone = "dark",
  className,
}: Props) {
  const light = tone === "light";
  const { preferences, setDisplayCurrency } = useLocale();
  const [mounted, setMounted] = useState(false);
  const selectId = useId();
  const selected = publicCurrencyTriggerLabel(preferences.currency);
  const options = orderedPublicDisplayCurrencies();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className={cn(
          "skiptranslate notranslate inline-flex h-8 min-w-[3.25rem] items-center justify-center rounded-full border px-2 text-[11px] font-bold",
          light
            ? "border-slate-200/90 bg-white/80 text-slate-800"
            : "border-white/10 bg-white/5 text-white",
          className,
        )}
        translate="no"
      >
        USD
      </span>
    );
  }

  return (
    <div
      className={cn("skiptranslate notranslate relative", className)}
      translate="no"
    >
      <label className="sr-only" htmlFor={selectId}>
        Display currency
      </label>
      <select
        id={selectId}
        className={cn(
          "cursor-pointer appearance-none border font-bold tracking-wide backdrop-blur-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]",
          light
            ? "border-slate-200/90 bg-white/85 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white"
            : "border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.09]",
          compact
            ? "h-8 rounded-full py-0 pr-7 pl-2.5 text-[11px]"
            : "h-[38px] rounded-full py-0 pr-8 pl-3 text-[12px]",
        )}
        value={selected}
        aria-label={`Display currency: ${selected}`}
        translate="no"
        onChange={(event) => {
          setDisplayCurrency(event.target.value as PublicDisplayCurrency);
        }}
      >
        {options.map((code) => (
          <option key={code} value={code} className="bg-white text-slate-900">
            {code}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 right-2 size-[10px] -translate-y-1/2 opacity-55",
          compact ? "right-1.5" : "right-2",
        )}
        aria-hidden
      />
    </div>
  );
}
