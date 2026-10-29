import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import {
  Caveat,
  DM_Sans,
  Geist_Mono,
  Manrope,
  Noto_Sans_Devanagari,
} from "next/font/google";

import { DomainCartShell } from "@/components/domains/domain-cart-shell";
import { GoogleTranslateBridge } from "@/components/locale/google-translate-bridge";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { LOCALE_COOKIE, parsePreferencesCookie } from "@/lib/i18n/preferences";
import { normalizeEnabledLanguageCodes } from "@/lib/i18n/website-languages";
import { buildMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/orbit/content";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-deva",
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = buildMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialPreferences = parsePreferencesCookie(
    cookieStore.get(LOCALE_COOKIE)?.value,
  );
  const siteSettings = await getSiteSettings();
  const enabledLanguageCodes = normalizeEnabledLanguageCodes(
    siteSettings.websiteLanguageEnabledCodes,
  );
  const htmlLang = initialPreferences.googleTargetLang || "en";

  return (
    <html lang={htmlLang} dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="" />
      </head>
      <body
        className={`${manrope.variable} ${dmSans.variable} ${geistMono.variable} ${caveat.variable} ${notoDevanagari.variable} min-h-dvh bg-black font-sans text-white antialiased`}
      >
        <LocaleProvider
          initialPreferences={initialPreferences}
          initialDisplayCurrencyRates={siteSettings.displayCurrencyRates ?? {}}
          initialEnabledLanguageCodes={enabledLanguageCodes}
        >
          <GoogleTranslateBridge />
          <DomainCartShell>
            <div id="hb-translate-root">
              <SiteNavigation />
              {children}
            </div>
          </DomainCartShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
