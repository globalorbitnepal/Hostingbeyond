"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useLocale } from "@/components/locale/locale-provider";
import {
  PUBLIC_DISPLAY_CURRENCIES,
  PUBLIC_DISPLAY_CURRENCY_LABELS,
  publicCurrencyTriggerLabel,
} from "@/lib/i18n/display-currencies";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  tone?: "dark" | "light";
  menuAlign?: "start" | "end";
  menuSide?: "below" | "above";
  className?: string;
};

const MENU_WIDTH = { compact: 200, default: 220 } as const;

function computeMenuPosition(
  trigger: DOMRect,
  align: "start" | "end",
  side: "below" | "above",
  width: number,
): CSSProperties {
  const margin = 8;
  let left = align === "start" ? trigger.left : trigger.right - width;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

  if (side === "above") {
    return {
      position: "fixed",
      left,
      bottom: window.innerHeight - trigger.top + margin,
      width,
      zIndex: 300,
    };
  }

  return {
    position: "fixed",
    left,
    top: trigger.bottom + margin,
    width,
    zIndex: 300,
  };
}

export function CurrencySelector({
  compact = false,
  tone = "dark",
  menuAlign = "end",
  menuSide = "below",
  className,
}: Props) {
  const light = tone === "light";
  const { preferences, setDisplayCurrency, t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<CSSProperties | null>(null);

  const selected = publicCurrencyTriggerLabel(preferences.currency);

  useEffect(() => setMounted(true), []);

  const closePanel = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closePanel();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [open, closePanel]);

  const menuWidth = compact ? MENU_WIDTH.compact : MENU_WIDTH.default;

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setMenuPosition(
      computeMenuPosition(
        el.getBoundingClientRect(),
        menuAlign,
        menuSide,
        menuWidth,
      ),
    );
  }, [menuAlign, menuSide, menuWidth]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex h-8 min-w-[3.25rem] items-center justify-center rounded-full border px-2 text-[11px] font-bold",
          light
            ? "border-slate-200/90 bg-white/80 text-slate-800"
            : "border-white/10 bg-white/5 text-white",
          className,
        )}
      >
        USD
      </span>
    );
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Display currency: ${selected}`}
        className={cn(
          "inline-flex items-center gap-1 border backdrop-blur-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]",
          light
            ? "border-slate-200/90 bg-white/85 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white"
            : "border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.09]",
          compact
            ? "h-8 rounded-full py-0 pr-2 pl-2.5 text-[11px]"
            : "h-[38px] rounded-full py-0 pr-2.5 pl-3 text-[12px]",
        )}
      >
        <span className="font-bold tracking-tight">{selected}</span>
        <ChevronDown
          className={cn(
            "size-[10px] shrink-0 opacity-55 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && menuPosition
          ? createPortal(
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 3, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "overflow-hidden rounded-[14px] border py-1 shadow-[0_16px_40px_rgba(15,23,42,0.12)]",
                  light
                    ? "border-slate-200/90 bg-white"
                    : "border-white/[0.12] bg-[#0c1528]",
                )}
                style={menuPosition}
                role="listbox"
                aria-label="Select display currency"
              >
                {PUBLIC_DISPLAY_CURRENCIES.map((code) => {
                  const meta = PUBLIC_DISPLAY_CURRENCY_LABELS[code];
                  const sel = preferences.currency === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      role="option"
                      aria-selected={sel}
                      onClick={() => {
                        setDisplayCurrency(code);
                        closePanel();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[13px]",
                        light
                          ? sel
                            ? "bg-indigo-50 font-semibold text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                          : sel
                            ? "bg-[rgba(37,99,235,0.18)] font-semibold text-white"
                            : "text-white/85 hover:bg-white/[0.06]",
                      )}
                    >
                      <span>
                        {meta.symbol} {meta.title}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-bold",
                          light ? "text-slate-400" : "text-white/45",
                        )}
                      >
                        {meta.code}
                      </span>
                    </button>
                  );
                })}
                <p
                  className={cn(
                    "border-t px-3 py-2 text-[10px] leading-snug",
                    light
                      ? "border-slate-100 text-slate-500"
                      : "border-white/[0.06] text-white/40",
                  )}
                >
                  {t.common.billedInUsd}
                </p>
              </motion.div>,
              document.body,
            )
          : null}
      </AnimatePresence>
    </div>
  );
}
