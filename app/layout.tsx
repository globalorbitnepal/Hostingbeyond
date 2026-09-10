import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DM_Sans, Geist_Mono, Manrope } from "next/font/google";

import { LocaleProvider } from "@/components/locale/locale-provider";
import { LOCALE_COOKIE, parsePreferencesCookie } from "@/lib/i18n/preferences";
import { buildMetadata } from "@/lib/metadata";

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

export const metadata: Metadata = buildMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialPreferences = parsePreferencesCookie(
    cookieStore.get(LOCALE_COOKIE)?.value,
  );
  const isRtl = initialPreferences.language === "ar";

  return (
    <html
      lang={initialPreferences.language}
      dir={isRtl ? "rtl" : "ltr"}
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="" />
      </head>
      <body
        className={`${manrope.variable} ${dmSans.variable} ${geistMono.variable} min-h-dvh bg-black font-sans text-white antialiased`}
      >
        <LocaleProvider initialPreferences={initialPreferences}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
