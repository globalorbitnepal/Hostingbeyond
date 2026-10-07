import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Headphones,
  Mail,
  MapPin,
  Megaphone,
  Shield,
} from "lucide-react";

import type { CmsContactPageContent } from "@/lib/orbit/contact-page-content";

const CHANNEL_ICONS = [Headphones, Mail, Shield, Megaphone];

export function ContactPremiumHero({
  content,
  contactEmail,
}: {
  content: CmsContactPageContent;
  contactEmail: string;
}) {
  return (
    <section className="hb-band-purple relative overflow-hidden py-14 text-white sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(255,255,255,0.16),transparent_42%),radial-gradient(ellipse_at_88%_100%,rgba(37,99,235,0.35),transparent_50%)]"
      />
      <div className="hb-shell relative max-w-3xl">
        <p className="text-[11px] font-bold tracking-[0.24em] text-[#c4b5fd] uppercase">
          {content.heroEyebrow}
        </p>
        <h1 className="font-heading mt-3 text-[clamp(2rem,4.5vw,3.35rem)] leading-[1.08] font-extrabold tracking-[-0.04em]">
          {content.heroTitle}{" "}
          <span className="text-[#c7d7ff]">{content.heroTitleAccent}</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/88 sm:text-[17px]">
          {content.heroDescription}
        </p>
        {contactEmail ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15">
            <Mail className="size-4" aria-hidden />
            <a href={`mailto:${contactEmail}`} className="hover:underline">
              {contactEmail}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ContactIntro({ content }: { content: CmsContactPageContent }) {
  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1a1035]">
          {content.introTitle}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {content.introBody}
        </p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-6">
        <p className="text-sm leading-relaxed text-slate-600">
          {content.introBodySecondary}
        </p>
      </div>
    </section>
  );
}

export function ContactChannels({
  content,
}: {
  content: CmsContactPageContent;
}) {
  const channels = content.channels.filter((c) => c.visible !== false);
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.channelsTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        {content.channelsIntro}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {channels.map((channel, i) => {
          const Icon = CHANNEL_ICONS[i % CHANNEL_ICONS.length];
          return (
            <article
              key={channel.id}
              className="flex h-full flex-col rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-white">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-[#1a1035]">
                {channel.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">
                {channel.description}
              </p>
              <Link
                href={channel.href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#673de6] hover:underline"
              >
                {channel.actionLabel}
                <ArrowRight className="size-3.5" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ContactHelpLinks({
  content,
}: {
  content: CmsContactPageContent;
}) {
  const links = content.helpLinks.filter((l) => l.visible !== false);
  return (
    <section className="rounded-3xl border border-violet-100 bg-[#faf8ff] p-6 sm:p-10">
      <div className="flex items-start gap-3">
        <BookOpen className="size-6 shrink-0 text-[#673de6]" aria-hidden />
        <div>
          <h2 className="text-2xl font-extrabold text-[#1a1035]">
            {content.helpTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{content.helpIntro}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="rounded-xl border border-violet-100 bg-white p-4 transition hover:border-violet-200 hover:shadow-sm"
          >
            <h3 className="font-bold text-[#1a1035]">{link.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ContactMedia({ content }: { content: CmsContactPageContent }) {
  return (
    <section className="grid gap-6 lg:grid-cols-2 lg:items-center">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1a1035]">
          {content.mediaTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {content.mediaDescription}
        </p>
      </div>
      <a
        href={`mailto:${content.mediaEmail}`}
        className="inline-flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-6 py-4 text-lg font-semibold text-[#673de6] shadow-sm hover:border-violet-200"
      >
        <Mail className="size-5" />
        {content.mediaEmail}
      </a>
    </section>
  );
}

export function ContactOffices({
  content,
}: {
  content: CmsContactPageContent;
}) {
  const offices = content.offices.filter((o) => o.visible !== false);
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#1a1035]">
        {content.officesTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        {content.officesIntro}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offices.map((office) => (
          <address
            key={office.id}
            className="rounded-2xl border border-violet-100 bg-white p-6 not-italic shadow-sm"
          >
            <MapPin className="size-5 text-[#673de6]" aria-hidden />
            <p className="mt-3 text-lg font-bold text-[#1a1035]">
              {office.city}
              {office.country ? `, ${office.country}` : ""}
            </p>
            <p className="mt-2 text-sm text-slate-600">{office.addressLine1}</p>
            {office.addressLine2 ? (
              <p className="text-sm text-slate-600">{office.addressLine2}</p>
            ) : null}
          </address>
        ))}
      </div>
    </section>
  );
}

export function ContactResponse({
  content,
}: {
  content: CmsContactPageContent;
}) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-extrabold text-[#1a1035]">
        {content.responseTitle}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {content.responseBody}
      </p>
    </section>
  );
}

export function ContactFaq({ content }: { content: CmsContactPageContent }) {
  const faqs = content.faqs.filter((f) => f.visible !== false);
  if (!faqs.length) return null;
  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold text-[#1a1035]">FAQ</h2>
      <ul className="mt-6 divide-y divide-violet-100">
        {faqs.map((faq) => (
          <li key={faq.id} className="py-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-[#1a1035] marker:content-none">
                {faq.question}
                <ChevronDown
                  className="size-5 shrink-0 text-[#673de6] transition group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ContactCtaBand({
  content,
}: {
  content: CmsContactPageContent;
}) {
  return (
    <section className="hb-band-purple relative overflow-hidden rounded-3xl px-6 py-10 text-center text-white sm:px-10 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-[#c4b5fd] uppercase">
          {content.ctaEyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          {content.ctaTitle}
        </h2>
        <p className="mt-3 text-sm text-white/85">{content.ctaDescription}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={content.ctaPrimaryHref}
            className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-extrabold text-[#2f1c6a]"
          >
            {content.ctaPrimaryLabel}
          </Link>
          <Link
            href={content.ctaSecondaryHref}
            className="inline-flex h-12 items-center rounded-xl border border-white/35 px-6 text-sm font-bold text-white hover:bg-white/10"
          >
            {content.ctaSecondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
