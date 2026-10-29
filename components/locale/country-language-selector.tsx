"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useId,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";

import { flagImgUrl, getCountry } from "@/config/geo";
import { resolveCountryDisplayCurrency } from "@/lib/i18n/country-currency";
import {
  indexAfterQueryChange,
  nextActiveIndex,
} from "@/lib/i18n/locale-list-nav";
import {
  searchCountryMarkets,
  type HostingerLocaleMarket,
} from "@/lib/i18n/hostinger-locale-markets";
import {
  WEBSITE_LANGUAGES,
  websiteLanguageByCode,
  websiteLanguageFlagCountryCode,
  type WebsiteLanguageCode,
} from "@/lib/i18n/website-languages";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";

type MenuRow =
  | {
      kind: "lang";
      id: string;
      code: WebsiteLanguageCode;
      englishName: string;
      nativeName: string;
    }
  | { kind: "country"; id: string; market: HostingerLocaleMarket };

type Props = {
  compact?: boolean;
  /** Login mockup style: globe + English (US) */
  variant?: "flag" | "globe";
  /** Light glass header uses dark text / white chips */
  tone?: "dark" | "light";
  /** Horizontal alignment of the menu panel to the trigger */
  menuAlign?: "start" | "end";
  /** Prefer opening above the trigger (e.g. footer) */
  menuSide?: "below" | "above";
  className?: string;
};

const MENU_WIDTH = { compact: 328, default: 380 } as const;
const LOCALE_PANEL_OPEN = "hb-locale-panel-open";

function indexOfSelectedCountryRow(
  countryCode: string,
  markets: HostingerLocaleMarket[],
): number {
  const code = countryCode.trim().toUpperCase();
  return markets.findIndex((market) => market.countryCode === code);
}

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
      maxHeight: "min(480px, 72dvh)",
      zIndex: 4000,
    };
  }

  return {
    position: "fixed",
    left,
    top: trigger.bottom + margin,
    width,
    maxHeight: "min(520px, 80dvh)",
    zIndex: 4000,
  };
}

/** Real US flag first (local SVG); other countries via flagcdn */
function FlagImg({
  code,
  size = 24,
  className,
  priority = false,
  tone = "dark",
}: {
  code: string;
  size?: number;
  className?: string;
  priority?: boolean;
  tone?: "dark" | "light";
}) {
  const normalized = code.trim().toUpperCase();
  const [format, setFormat] = useState<"svg" | "png" | "failed">("svg");
  const light = tone === "light";

  const chipClass = cn(
    "inline-flex shrink-0 overflow-hidden rounded-full border",
    light
      ? "border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
      : "border-white/15 bg-[#1a2540]",
    className,
  );

  // Always use crisp local US flag — CDN/crop looked wrong in the header chip
  if (normalized === "US") {
    return (
      <span
        className={chipClass}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {/* Raster flag reads clearer than SVG at 24–28px circle */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/flags/us.png"
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </span>
    );
  }

  if (!/^[A-Z]{2}$/.test(normalized) || format === "failed") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
          light
            ? "border border-slate-200 bg-slate-100 text-slate-500"
            : "bg-white/10 text-white/60",
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {normalized.slice(0, 2)}
      </span>
    );
  }

  const src = flagImgUrl(normalized, format === "png" ? "png" : "svg");

  return (
    <span className={chipClass} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
        onError={() => {
          setFormat((current) => (current === "svg" ? "png" : "failed"));
        }}
      />
    </span>
  );
}

export function CountryLanguageSelector({
  compact = false,
  variant = "flag",
  tone = "dark",
  menuAlign = "end",
  menuSide = "below",
  className,
}: Props) {
  const light = tone === "light";
  const {
    preferences,
    applyCountryMarket,
    setWebsiteLanguage,
    enabledLanguageCodes,
    currencyNotice,
    t,
  } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [listSection, setListSection] = useState<"country" | "language">(
    "country",
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const panelId = useId();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuPosition, setMenuPosition] = useState<CSSProperties | null>(null);

  const country = getCountry(preferences.country);
  const activeLanguage =
    websiteLanguageByCode(preferences.googleTargetLang) ??
    websiteLanguageByCode("en")!;
  const enabled = useMemo(
    () => new Set(enabledLanguageCodes),
    [enabledLanguageCodes],
  );
  const rows = useMemo<MenuRow[]>(() => {
    const q = query.trim().toLowerCase();
    const countryMarkets = searchCountryMarkets(query);
    const countries: MenuRow[] = countryMarkets.map((market) => ({
      kind: "country" as const,
      id: `country:${market.countryCode}`,
      market,
    }));
    const langs: MenuRow[] = WEBSITE_LANGUAGES.filter((row) => {
      if (!enabled.has(row.code)) return false;
      if (!q) return true;
      return (
        row.englishName.toLowerCase().includes(q) ||
        row.nativeName.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.triggerCode.toLowerCase().includes(q)
      );
    }).map((row) => ({
      kind: "lang" as const,
      id: `lang:${row.code}`,
      code: row.code,
      englishName: row.englishName,
      nativeName: row.nativeName,
    }));
    if (listSection === "country") return countries;
    return langs;
  }, [enabled, listSection, query]);
  const menuWidth = compact ? MENU_WIDTH.compact : MENU_WIDTH.default;
  const localeInstance = menuSide === "above" ? "footer" : "header";

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onOtherPanelOpen = (event: Event) => {
      const openedId = (event as CustomEvent<string>).detail;
      if (openedId !== panelId) closePanel();
    };
    window.addEventListener(LOCALE_PANEL_OPEN, onOtherPanelOpen);
    return () =>
      window.removeEventListener(LOCALE_PANEL_OPEN, onOtherPanelOpen);
  }, [panelId, closePanel]);

  const positionMenuFromTrigger = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    setMenuPosition(computeMenuPosition(rect, menuAlign, menuSide, menuWidth));
  }, [menuAlign, menuSide, menuWidth]);

  const openPanel = useCallback(() => {
    setQuery("");
    setListSection("country");
    const markets = searchCountryMarkets("");
    const selectedCountryIndex = indexOfSelectedCountryRow(
      preferences.country,
      markets,
    );
    setActiveIndex(selectedCountryIndex >= 0 ? selectedCountryIndex : 0);
    positionMenuFromTrigger();
    window.dispatchEvent(
      new CustomEvent(LOCALE_PANEL_OPEN, { detail: panelId }),
    );
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, [panelId, positionMenuFromTrigger, preferences.country]);

  const togglePanel = useCallback(() => {
    if (open) closePanel();
    else openPanel();
  }, [open, closePanel, openPanel]);

  // Close on outside click or Escape
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

  const updateMenuPosition = useCallback(() => {
    positionMenuFromTrigger();
  }, [positionMenuFromTrigger]);

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

  /** A changed query replaces the result set — keep the cursor in range. */
  const prevResultCount = useRef(rows.length);
  useEffect(() => {
    setActiveIndex((current) =>
      indexAfterQueryChange(prevResultCount.current, rows.length, current),
    );
    prevResultCount.current = rows.length;
  }, [query, rows.length]);

  // Scroll keyboard focus into view (selected country uses aria-selected styling only)
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      '[data-keyboard-focus="true"]',
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const selectRow = (row: MenuRow) => {
    if (row.kind === "lang") setWebsiteLanguage(row.code);
    else applyCountryMarket(row.market);
    closePanel();
  };

  const switchListSection = (section: "country" | "language") => {
    setListSection(section);
    setQuery("");
    if (section === "country") {
      const markets = searchCountryMarkets("");
      const idx = indexOfSelectedCountryRow(preferences.country, markets);
      setActiveIndex(idx >= 0 ? idx : 0);
    } else {
      const enabledLangs = WEBSITE_LANGUAGES.filter((row) =>
        enabled.has(row.code),
      );
      const idx = enabledLangs.findIndex(
        (row) => row.code === preferences.googleTargetLang,
      );
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  };

  const onSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!rows.length) return;
    const next = nextActiveIndex(e.key, activeIndex, rows.length);
    if (next != null) {
      e.preventDefault();
      setActiveIndex(next);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = rows[activeIndex];
      if (opt) selectRow(opt);
    }
  };

  // SSR placeholder
  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 border backdrop-blur-xl",
          light
            ? "border-slate-200/90 bg-white/80"
            : "border-white/[0.10] bg-white/[0.05]",
          compact ? "h-8 rounded-full px-2" : "h-[38px] rounded-full px-2.5",
          className,
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full",
            light ? "bg-slate-200" : "bg-white/10",
          )}
        />
        <span
          className={cn(
            "text-[11px] font-bold sm:text-[12px]",
            light ? "text-slate-900" : "text-white",
          )}
        >
          {activeLanguage.triggerCode}
        </span>
        <ChevronDown
          className={cn(
            "size-[10px] shrink-0 opacity-55",
            light ? "text-slate-500" : "text-white/55",
          )}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="notranslate relative" translate="no">
      <button
        ref={triggerRef}
        type="button"
        onClick={togglePanel}
        data-hb-locale-trigger={`${localeInstance}-${panelId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.locale.selectLocation}
        className={cn(
          "inline-flex items-center gap-1.5 border backdrop-blur-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]",
          light
            ? "border-slate-200/90 bg-white/85 text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:bg-white"
            : "border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.09]",
          compact
            ? "h-8 rounded-full py-0 pr-2 pl-1.5"
            : "h-[38px] rounded-full py-0 pr-2.5 pl-2",
          className,
        )}
      >
        {variant === "globe" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={cn(
              "size-4 shrink-0",
              light ? "text-slate-500" : "text-white/75",
            )}
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z" />
          </svg>
        ) : (
          <FlagImg
            code={country.code}
            size={compact ? 22 : 26}
            priority
            tone={tone}
          />
        )}
        <span
          className={cn(
            "min-w-[1.75rem] text-center text-[11px] font-bold tracking-wide sm:text-[12px]",
            light ? "text-slate-900" : "text-white",
          )}
        >
          {activeLanguage.triggerCode}
        </span>
        <ChevronDown
          className={cn(
            "size-[10px] shrink-0 opacity-55 transition-transform duration-200",
            open && "rotate-180",
            light ? "text-slate-500" : "text-white/55",
          )}
          aria-hidden
        />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className={cn(
                "notranslate flex flex-col overflow-hidden rounded-[16px] border backdrop-blur-2xl",
                light
                  ? "border-slate-200/90 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
                  : "border-white/[0.12] bg-[#0c1528] shadow-[0_20px_60px_rgba(0,0,0,0.65)]",
              )}
              translate="no"
              style={
                menuPosition ?? {
                  position: "fixed",
                  top: 80,
                  right: 16,
                  width: menuWidth,
                  maxHeight: "min(520px, 80dvh)",
                  zIndex: 4000,
                }
              }
            >
              <div
                className={cn(
                  "shrink-0 border-b px-4 py-3.5",
                  light ? "border-slate-200/80" : "border-white/[0.07]",
                )}
              >
                <p
                  className={cn(
                    "text-[14px] leading-snug font-bold",
                    light ? "text-slate-900" : "text-white",
                  )}
                >
                  {t.locale.selectLocation}
                </p>
              </div>

              <div
                className={cn(
                  "shrink-0 border-b px-3 py-2.5",
                  light ? "border-slate-200/70" : "border-white/[0.06]",
                )}
              >
                <label className="relative block">
                  <Search
                    className={cn(
                      "pointer-events-none absolute top-1/2 left-3 size-[13px] -translate-y-1/2",
                      light ? "text-slate-400" : "text-white/35",
                    )}
                    aria-hidden
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    placeholder={t.locale.searchPlaceholder}
                    className={cn(
                      "h-[38px] w-full rounded-[10px] border pr-3 pl-9 text-[13px] outline-none",
                      light
                        ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#6366f1]/50 focus:bg-white"
                        : "border-white/[0.10] bg-white/[0.05] text-white placeholder:text-white/30 focus:border-[#2563eb]/50",
                    )}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div
                className={cn(
                  "flex shrink-0 gap-1 border-b px-3 py-2",
                  light ? "border-slate-200/70" : "border-white/[0.06]",
                )}
                role="tablist"
                aria-label={t.locale.selectLocation}
              >
                {(
                  [
                    ["country", "Country & currency"],
                    ["language", "Language"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={listSection === id}
                    onClick={() => switchListSection(id)}
                    className={cn(
                      "flex-1 rounded-[10px] px-2 py-2 text-[11px] font-bold tracking-wide uppercase transition-colors",
                      listSection === id
                        ? light
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-[#2563eb] text-white"
                        : light
                          ? "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          : "text-white/45 hover:bg-white/[0.06] hover:text-white/80",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div
                ref={listRef}
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overscroll-contain py-1",
                  light ? "hb-locale-scroll-light" : "hb-locale-scroll",
                )}
                role="listbox"
              >
                {rows.length === 0 ? (
                  <p
                    className={cn(
                      "px-4 py-6 text-center text-[12px]",
                      light ? "text-slate-400" : "text-white/40",
                    )}
                  >
                    {t.locale.noResults}
                  </p>
                ) : (
                  rows.map((row, index) => {
                    const selected =
                      row.kind === "lang"
                        ? row.code === preferences.googleTargetLang
                        : row.market.countryCode === preferences.country;
                    const keyboardFocus = index === activeIndex && !selected;

                    return (
                      <button
                        key={row.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        aria-label={
                          row.kind === "lang"
                            ? `${row.englishName} (${row.nativeName})`
                            : `${row.market.countryName}, ${resolveCountryDisplayCurrency(row.market.countryCode).currency}`
                        }
                        data-keyboard-focus={String(keyboardFocus)}
                        onClick={() => selectRow(row)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-[10px] text-left transition-colors duration-100",
                          light
                            ? selected
                              ? "bg-indigo-50 text-slate-900 ring-1 ring-indigo-200/80 ring-inset"
                              : keyboardFocus
                                ? "bg-slate-50 text-slate-900 ring-1 ring-slate-200 ring-inset"
                                : "text-slate-700 hover:bg-slate-50/90 hover:text-slate-900"
                            : selected
                              ? "bg-[rgba(37,99,235,0.22)] text-white ring-1 ring-[#2563eb]/40 ring-inset"
                              : keyboardFocus
                                ? "bg-white/[0.08] text-white ring-1 ring-white/15 ring-inset"
                                : "text-white/80 hover:bg-white/[0.05] hover:text-white",
                        )}
                      >
                        {row.kind === "country" ? (
                          <FlagImg
                            code={row.market.countryCode}
                            size={26}
                            tone={tone}
                          />
                        ) : (
                          <FlagImg
                            code={websiteLanguageFlagCountryCode(row.code)}
                            size={26}
                            tone={tone}
                          />
                        )}

                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                          {row.kind === "lang"
                            ? row.englishName
                            : row.market.countryName}
                        </span>

                        <span
                          className={cn(
                            "shrink-0 text-[12px] font-normal tabular-nums",
                            light ? "text-slate-400" : "text-white/45",
                          )}
                        >
                          {row.kind === "lang"
                            ? row.nativeName
                            : resolveCountryDisplayCurrency(
                                row.market.countryCode,
                              ).currency}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <p
                className={cn(
                  "shrink-0 border-t px-4 py-2.5 text-[10px] leading-snug",
                  light
                    ? "border-slate-200/80 text-slate-500"
                    : "border-white/[0.07] text-white/40",
                )}
              >
                {currencyNotice}
              </p>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
