"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { getCountry, languages, type LanguageCode } from "@/config/geo";
import {
  normalizePublicDisplayCurrency,
  type PublicDisplayCurrency,
} from "@/lib/i18n/display-currencies";
import { serverCopyLanguage } from "@/lib/i18n/server-copy-language";
import {
  getLocaleMarket,
  type HostingerLocaleMarket,
} from "@/lib/i18n/hostinger-locale-markets";
import {
  clearGoogtransCookie,
  isGoogleTranslationActive,
  writeGoogtransCookie,
} from "@/lib/i18n/google-translate-client";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";
import {
  formatMoney,
  formatUsdAsLocal,
  getProductPrice,
  type CurrencyCode,
  type ProductPriceId,
} from "@/config/pricing";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import {
  LOCALE_COOKIE,
  normalizePreferences,
  preferencesCookieOptions,
  serializePreferences,
  type UserPreferences,
} from "@/lib/i18n/preferences";
import {
  resolveUsdToLocalRate,
  type DisplayCurrencyRateOverrides,
} from "@/lib/pricing/display-rates";

type LocaleContextValue = {
  preferences: UserPreferences;
  dictionary: Dictionary;
  isPending: boolean;
  setCountry: (
    countryCode: string,
    options?: { suggestLanguage?: boolean },
  ) => void;
  setLanguage: (language: LanguageCode) => void;
  applyLocaleMarket: (market: HostingerLocaleMarket) => void;
  setDisplayCurrency: (currency: PublicDisplayCurrency) => void;
  applySelection: (input: { country: string; language: LanguageCode }) => void;
  formatPrice: (productId: ProductPriceId) => string;
  formatCatalogUsd: (usdAmount: number) => string;
  t: {
    nav: Dictionary["nav"];
    locale: Dictionary["locale"];
    hero: Dictionary["hero"];
    products: Dictionary["products"];
    common: Dictionary["common"];
  };
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writePrefsCookie(prefs: UserPreferences) {
  if (typeof document === "undefined") return;
  const opts = preferencesCookieOptions();
  const secure = opts.secure ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(serializePreferences(prefs))}; Path=${opts.path}; Max-Age=${opts.maxAge}; SameSite=${opts.sameSite}${secure}`;
}

export function LocaleProvider({
  children,
  initialPreferences,
  initialDisplayCurrencyRates = {},
}: {
  children: ReactNode;
  initialPreferences: UserPreferences;
  initialDisplayCurrencyRates?: DisplayCurrencyRateOverrides;
}) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(() =>
    normalizePreferences(initialPreferences),
  );
  const [displayCurrencyRates] = useState(initialDisplayCurrencyRates);
  const [isPending, startTransition] = useTransition();

  const dictionary = useMemo(
    () => getDictionary(serverCopyLanguage(preferences)),
    [preferences],
  );

  useEffect(() => {
    if (!PUBLIC_ENGLISH_ONLY) return;
    clearGoogtransCookie();
    writePrefsCookie(normalizePreferences(preferences));
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, [preferences]);

  const commit = useCallback(
    (next: UserPreferences) => {
      const normalized = normalizePreferences(next);
      startTransition(() => {
        setPreferences(normalized);
      });
      writePrefsCookie(normalized);
      if (typeof document !== "undefined") {
        const langAttr = isGoogleTranslationActive(normalized.googleTargetLang)
          ? (normalized.googleTargetLang.split("-")[0] ?? normalized.language)
          : normalized.language;
        document.documentElement.lang = langAttr;
        document.documentElement.dir =
          normalized.googleTargetLang === "ar" || normalized.language === "ar"
            ? "rtl"
            : "ltr";
        if (isGoogleTranslationActive(normalized.googleTargetLang)) {
          writeGoogtransCookie(normalized.googleTargetLang);
        } else {
          clearGoogtransCookie();
        }
      }
      router.refresh();
    },
    [router],
  );

  const setCountry = useCallback(
    (countryCode: string, options?: { suggestLanguage?: boolean }) => {
      const country = getCountry(countryCode);
      commit({
        ...preferences,
        country: country.code,
        language:
          options?.suggestLanguage === true && !preferences.languageLocked
            ? country.defaultLanguage
            : preferences.language,
      });
    },
    [commit, preferences],
  );

  const setLanguage = useCallback(
    (language: LanguageCode) => {
      commit({
        ...preferences,
        language: PUBLIC_ENGLISH_ONLY ? "en" : language,
        languageLocked: true,
      });
    },
    [commit, preferences],
  );

  const setDisplayCurrency = useCallback(
    (currency: PublicDisplayCurrency) => {
      commit({
        ...preferences,
        currency: normalizePublicDisplayCurrency(currency),
      });
    },
    [commit, preferences],
  );

  const applyLocaleMarket = useCallback(
    (market: HostingerLocaleMarket) => {
      const country = getCountry(market.countryCode);
      const prevGoogle = preferences.googleTargetLang;
      const next = normalizePreferences({
        ...preferences,
        country: country.code,
        language: "en",
        localeMarketId: market.id,
        googleTargetLang: "en",
        languageLocked: true,
      });
      commit(next);
      if (prevGoogle !== market.googleTargetLang) {
        window.location.reload();
      }
    },
    [commit, preferences],
  );

  const applySelection = useCallback(
    (input: { country: string; language: LanguageCode }) => {
      const country = getCountry(input.country);
      const marketId =
        input.country === "US"
          ? "US-en"
          : input.country === "IN"
            ? "IN-en"
            : preferences.localeMarketId;
      const market = getLocaleMarket(marketId);
      applyLocaleMarket({
        ...market,
        countryCode: country.code,
        appLanguage: "en",
        googleTargetLang: "en",
        id: marketId,
      });
    },
    [applyLocaleMarket, preferences.localeMarketId],
  );

  const formatPrice = useCallback(
    (productId: ProductPriceId) => {
      const rate = resolveUsdToLocalRate(
        preferences.currency as CurrencyCode,
        displayCurrencyRates,
      );
      const amount = getProductPrice(
        productId,
        preferences.currency as CurrencyCode,
        rate,
      );
      const locale =
        languages[preferences.language]?.locale ?? languages.en.locale;
      return formatMoney(amount, preferences.currency as CurrencyCode, locale);
    },
    [displayCurrencyRates, preferences.currency, preferences.language],
  );

  const formatCatalogUsd = useCallback(
    (usdAmount: number) => {
      const locale =
        languages[preferences.language]?.locale ?? languages.en.locale;
      const currency = preferences.currency as CurrencyCode;
      const rate = resolveUsdToLocalRate(currency, displayCurrencyRates);
      if (currency === "USD") {
        return formatMoney(usdAmount, "USD", locale);
      }
      return formatUsdAsLocal(usdAmount, currency, locale, rate);
    },
    [displayCurrencyRates, preferences.currency, preferences.language],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      preferences,
      dictionary,
      isPending,
      setCountry,
      setLanguage,
      applyLocaleMarket,
      setDisplayCurrency,
      applySelection,
      formatPrice,
      formatCatalogUsd,
      t: {
        nav: dictionary.nav,
        locale: dictionary.locale,
        hero: dictionary.hero,
        products: dictionary.products,
        common: dictionary.common,
      },
    }),
    [
      preferences,
      dictionary,
      isPending,
      setCountry,
      setLanguage,
      applyLocaleMarket,
      setDisplayCurrency,
      applySelection,
      formatPrice,
      formatCatalogUsd,
    ],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
