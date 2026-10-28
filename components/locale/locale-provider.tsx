"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { getCountry, languages, type LanguageCode } from "@/config/geo";
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
    () => getDictionary(preferences.language),
    [preferences.language],
  );

  const commit = useCallback(
    (next: UserPreferences) => {
      const normalized = normalizePreferences(next);
      startTransition(() => {
        setPreferences(normalized);
      });
      writePrefsCookie(normalized);
      if (typeof document !== "undefined") {
        document.documentElement.lang = normalized.language;
        document.documentElement.dir =
          normalized.language === "ar" ? "rtl" : "ltr";
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
        currency: country.currency,
        language:
          options?.suggestLanguage !== false && !preferences.languageLocked
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
        language,
        languageLocked: true,
      });
    },
    [commit, preferences],
  );

  const applySelection = useCallback(
    (input: { country: string; language: LanguageCode }) => {
      const country = getCountry(input.country);
      commit({
        country: country.code,
        currency: country.currency,
        language: input.language,
        languageLocked: true,
      });
    },
    [commit],
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
