import Link from "next/link";
import {
  Bell,
  Check,
  Globe,
  Headphones,
  List,
  ShieldCheck,
  Tag,
} from "lucide-react";

import { CountryLanguageSelector } from "@/components/locale/country-language-selector";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { PaymentMark } from "@/components/layout/payment-marks";
import { SocialMark } from "@/components/layout/social-marks";
import type { CmsFooterContent } from "@/lib/orbit/defaults";
import { defaultFooterSection } from "@/lib/orbit/defaults";

const PERK_ICONS = {
  tag: Tag,
  list: List,
  bell: Bell,
};

const TRUST_ICONS = {
  shield: ShieldCheck,
  globe: Globe,
  headphones: Headphones,
};

export function SiteFooter({
  content,
}: {
  content?: CmsFooterContent;
  logoPath?: string;
}) {
  const data = content ?? defaultFooterSection();
  if (!data.visible) return null;

  const perks = (data.newsletterPerks ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);
  const social = (data.social ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);
  const columns = (data.columns ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order)
    .map((column) => ({
      ...column,
      links: (column.links ?? [])
        .filter((link) => link.visible !== false)
        .sort((a, b) => a.order - b.order),
    }));
  const payments = (data.payments ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);
  const benefits = (data.paymentBenefits ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);
  const trust = (data.trustItems ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);
  const legal = (data.legalLinks ?? [])
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="relative isolate overflow-hidden pt-5 pb-7 text-slate-800">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#c9dcf3_0%,#9db8dc_42%,#6f93c4_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_12%_-10%,rgba(255,255,255,0.45),transparent_55%),radial-gradient(ellipse_70%_50%_at_92%_110%,rgba(30,58,110,0.35),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-[-8%] h-72 w-80 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.35),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] bottom-[-22%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(30,64,120,0.4),transparent_70%)] blur-3xl"
      />

      <div className="hb-shell relative z-10">
        <div className="rounded-[28px] border border-white/45 bg-[#163a66]/18 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_24px_60px_-32px_rgba(15,40,80,0.55)] backdrop-blur-2xl sm:px-7 sm:py-6 lg:px-8">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.2fr)_auto] lg:gap-8">
            <div>
              <p className="text-[11px] font-bold tracking-[0.22em] text-slate-600 uppercase">
                {data.newsletterEyebrow}
              </p>
              <h2 className="font-heading mt-1.5 text-[clamp(1.55rem,2.6vw,2.15rem)] leading-tight font-extrabold tracking-[-0.04em] text-slate-950">
                {data.newsletterTitle}{" "}
                <span className="bg-gradient-to-r from-[#1d4ed8] via-[#4338ca] to-[#6d28d9] bg-clip-text text-transparent">
                  {data.newsletterTitleAccent}
                </span>
              </h2>
              <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-700">
                {data.newsletterDescription}
              </p>
            </div>
            <NewsletterForm
              placeholder={data.newsletterPlaceholder}
              ctaLabel={data.newsletterCta}
              privacy={data.newsletterPrivacy}
            />
            <ul className="flex justify-between gap-3 sm:justify-end sm:gap-6 lg:min-w-[280px]">
              {perks.map((perk) => {
                const Icon = PERK_ICONS[perk.icon];
                return (
                  <li
                    key={perk.id}
                    className="flex min-w-[72px] flex-col items-center gap-2 text-center"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/50 bg-white/35 text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_18px_-12px_rgba(15,40,80,0.55)] backdrop-blur-md">
                      <Icon className="size-4" strokeWidth={2.1} />
                    </span>
                    <span className="max-w-[5.5rem] text-[11.5px] leading-tight font-semibold text-slate-800">
                      {perk.title}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2.6fr)] lg:gap-10">
          <div>
            <Link
              href="/"
              aria-label="HostingBeyond home"
              className="inline-flex max-w-full items-center"
            >
              {/* Native img — same file as the header, no Next crop in a shrinking grid. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/hostingbeyond-logo-v5.png"
                alt="HostingBeyond"
                width={1400}
                height={232}
                className="h-10 w-auto max-w-[min(100%,300px)] object-contain object-left sm:h-11"
                draggable={false}
              />
            </Link>
            <p className="mt-2 text-[10.5px] font-bold tracking-[0.22em] text-[#1d4ed8] uppercase">
              {data.brandTagline}
            </p>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-700">
              {data.brandDescription}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {social.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.network}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/50 bg-white/35 text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_16px_-12px_rgba(15,40,80,0.5)] backdrop-blur-md transition hover:bg-white/55 hover:text-[#1d4ed8]"
                  >
                    <SocialMark network={item.network} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
            {columns.map((column) => (
              <div key={column.id}>
                <h3 className="text-[15px] font-extrabold text-slate-950">
                  {column.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-[13.5px] font-medium text-slate-700 transition hover:text-[#1d4ed8]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[24px] border border-white/40 bg-[#102a4d]/22 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_20px_50px_-30px_rgba(8,25,55,0.55)] backdrop-blur-2xl sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[15px] font-extrabold text-slate-950">
                <span className="inline-flex size-7 items-center justify-center rounded-full border border-white/40 bg-white/30 text-[#1e3a8a] backdrop-blur-md">
                  <ShieldCheck className="size-3.5" />
                </span>
                {data.paymentsTitle}
              </p>
              <p className="mt-1 pl-9 text-[13px] text-slate-700">
                {data.paymentsDescription}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {payments.map((item) => (
                  <PaymentMark key={item.id} brand={item.brand} />
                ))}
              </div>
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2 xl:max-w-[280px] xl:grid-cols-1">
              {benefits.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 text-[13px] font-medium text-slate-800"
                >
                  <Check
                    className="size-4 shrink-0 text-[#1d4ed8]"
                    strokeWidth={2.6}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-y border-white/35 py-6 lg:flex-row lg:items-center lg:justify-between">
          <ul className="grid flex-1 gap-4 sm:grid-cols-3">
            {trust.map((item, index) => {
              const Icon = TRUST_ICONS[item.icon];
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 sm:justify-center lg:justify-start"
                >
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className="mr-1 hidden h-10 w-px bg-white/40 sm:block lg:mr-4"
                    />
                  ) : null}
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/30 text-[#1e3a8a] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-extrabold text-slate-950">
                      {item.title}
                    </span>
                    <span className="block text-[12.5px] text-slate-700">
                      {item.subtitle}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          {data.handwrittenNote ? (
            <p className="font-hand shrink-0 text-center text-[28px] leading-[1.05] font-semibold whitespace-pre-line text-[#1e3a8a] lg:rotate-[-8deg] lg:text-right">
              {data.handwrittenNote}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <CountryLanguageSelector compact variant="globe" tone="light" />
            {legal.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-[12.5px] font-medium text-slate-700 hover:text-[#1d4ed8]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-[12.5px] text-slate-700">{data.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
