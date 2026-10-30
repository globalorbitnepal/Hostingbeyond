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
import { Check, ChevronDown } from "lucide-react";

import { useLocale } from "@/components/locale/locale-provider";
import {
  FEATURED_DISPLAY_CURRENCIES,
  orderedPublicDisplayCurrencies,
  PUBLIC_DISPLAY_CURRENCY_LABELS,
  publicCurrencyTriggerLabel,
  type PublicDisplayCurrency,
} from "@/lib/i18n/display-currencies";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  /** Stretch the chip (mobile menu / full-width rows). */
  fill?: boolean;
  tone?: "dark" | "light";
  menuAlign?: "start" | "end";
  menuSide?: "below" | "above";
  className?: string;
};

const MENU_WIDTH = 240;
const LOCALE_PANEL_OPEN = "hb-locale-panel-open";
const FEATURED_SET = new Set<string>(FEATURED_DISPLAY_CURRENCIES);

function computeMenuPosition(
  trigger: DOMRect,
  align: "start" | "end",
  side: "below" | "above",
  width: number,
): CSSProperties {
  const margin = 8;
  const maxHeight = Math.min(420, Math.round(window.innerHeight * 0.62));
  const widthClamped = Math.min(width, window.innerWidth - margin * 2);
  let left = align === "start" ? trigger.left : trigger.right - widthClamped;
  left = Math.max(
    margin,
    Math.min(left, window.innerWidth - widthClamped - margin),
  );

  const spaceBelow = window.innerHeight - trigger.bottom - margin;
  const spaceAbove = trigger.top - margin;
  const openAbove =
    side === "above" || (spaceBelow < 220 && spaceAbove > spaceBelow);

  if (openAbove) {
    return {
      position: "fixed",
      left,
      bottom: window.innerHeight - trigger.top + margin,
      width: widthClamped,
      maxHeight,
      zIndex: 10050,
    };
  }

  return {
    position: "fixed",
    left,
    top: trigger.bottom + margin,
    width: widthClamped,
    maxHeight,
    zIndex: 10050,
  };
}

export function CurrencySelector({
  compact = false,
  fill = false,
  tone = "dark",
  menuAlign = "end",
  menuSide = "below",
  className,
}: Props) {
  const light = tone === "light";
  const { preferences, setDisplayCurrency } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<CSSProperties | null>(null);

  const selected = publicCurrencyTriggerLabel(preferences.currency);
  const options = orderedPublicDisplayCurrencies();
  const featured = options.filter((code) => FEATURED_SET.has(code));
  const rest = options.filter((code) => !FEATURED_SET.has(code));

  useEffect(() => setMounted(true), []);

  const closePanel = useCallback(() => setOpen(false), []);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setMenuPosition(
      computeMenuPosition(
        el.getBoundingClientRect(),
        menuAlign,
        menuSide,
        MENU_WIDTH,
      ),
    );
  }, [menuAlign, menuSide]);

  const openPanel = useCallback(() => {
    updateMenuPosition();
    window.dispatchEvent(
      new CustomEvent(LOCALE_PANEL_OPEN, { detail: "currency" }),
    );
    setOpen(true);
  }, [updateMenuPosition]);

  const togglePanel = useCallback(
    (event: { stopPropagation: () => void; preventDefault: () => void }) => {
      event.stopPropagation();
      event.preventDefault();
      if (open) closePanel();
      else openPanel();
    },
    [open, closePanel, openPanel],
  );

  useEffect(() => {
    const onOther = (event: Event) => {
      const openedId = (event as CustomEvent<string>).detail;
      if (openedId !== "currency") closePanel();
    };
    window.addEventListener(LOCALE_PANEL_OPEN, onOther);
    return () => window.removeEventListener(LOCALE_PANEL_OPEN, onOther);
  }, [closePanel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    const onOutside = (e: Event) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      closePanel();
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onOutside, true);
    }, 50);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside, true);
    };
  }, [open, closePanel]);

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

  const chipClass = cn(
    "inline-flex shrink-0 touch-manipulation items-center gap-0.5 border font-bold tracking-[0.06em] tabular-nums backdrop-blur-xl transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]",
    light
      ? "border-slate-200/90 bg-white/85 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white"
      : "border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.09]",
    fill ? "w-full justify-between px-2.5" : "justify-center",
    compact
      ? cn("h-8 rounded-full text-[11px]", !fill && "w-[4.35rem]")
      : cn("h-[38px] rounded-full text-[12px]", !fill && "w-[4.85rem]"),
  );

  if (!mounted) {
    return (
      <span className={cn(chipClass, className)} translate="no">
        USD
      </span>
    );
  }

  function renderOption(code: PublicDisplayCurrency) {
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
          "flex w-full min-w-0 items-center gap-2.5 px-3 py-2 text-left",
          light
            ? sel
              ? "bg-indigo-50 text-slate-900"
              : "text-slate-700 hover:bg-slate-50"
            : sel
              ? "bg-[rgba(37,99,235,0.18)] text-white"
              : "text-white/85 hover:bg-white/[0.06]",
        )}
      >
        <span className="w-11 shrink-0 text-[13px] font-extrabold tracking-[0.04em] tabular-nums">
          {meta.code}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[12px]",
            light ? "text-slate-500" : "text-white/50",
          )}
        >
          {meta.symbol} {meta.title}
        </span>
        {sel ? (
          <Check
            className={cn(
              "size-3.5 shrink-0",
              light ? "text-[#4f46e5]" : "text-[#93c5fd]",
            )}
            strokeWidth={2.6}
            aria-hidden
          />
        ) : (
          <span className="size-3.5 shrink-0" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "skiptranslate notranslate relative shrink-0",
        fill && "w-full min-w-0",
        className,
      )}
      translate="no"
    >
      <button
        ref={triggerRef}
        type="button"
        onPointerDown={togglePanel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Display currency: ${selected}`}
        className={cn(chipClass, "relative z-[2]")}
      >
        <span className="leading-none" translate="no">
          {selected}
        </span>
        <ChevronDown
          className={cn(
            "size-[10px] shrink-0 opacity-50 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className={cn(
                "skiptranslate notranslate overflow-y-auto overscroll-contain rounded-[16px] border",
                light
                  ? "border-slate-200/90 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]"
                  : "border-white/[0.12] bg-[#0c1528] shadow-[0_20px_60px_rgba(0,0,0,0.65)]",
              )}
              translate="no"
              role="listbox"
              aria-label="Select display currency"
              onPointerDown={(event) => event.stopPropagation()}
              style={
                menuPosition ?? {
                  position: "fixed",
                  top: 72,
                  right: 12,
                  width: Math.min(MENU_WIDTH, window.innerWidth - 24),
                  maxHeight: "min(420px, 62dvh)",
                  zIndex: 10050,
                }
              }
            >
              <p
                className={cn(
                  "sticky top-0 z-[1] px-3 pt-2.5 pb-1.5 text-[11px] font-extrabold tracking-wide uppercase",
                  light
                    ? "bg-white text-slate-400"
                    : "bg-[#0c1528] text-white/40",
                )}
              >
                Currency
              </p>
              <div className="pb-1">
                {featured.map(renderOption)}
                {rest.length > 0 ? (
                  <>
                    <div
                      className={cn(
                        "mx-3 my-1 h-px",
                        light ? "bg-slate-100" : "bg-white/[0.08]",
                      )}
                    />
                    {rest.map(renderOption)}
                  </>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
