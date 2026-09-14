"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Clock,
  Inbox,
  Lock,
  Mail,
  Minus,
  Plus,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const PRICE = "$0.02";

const plans = [
  {
    id: "starter",
    name: "Starter",
    bestFor: "Solo founders",
    original: "$0.99",
    off: "98% off",
    mailboxes: "1 mailbox",
    storage: "5 GB per mailbox",
    extras: "5 aliases · 5 forwards",
    features: [
      "Custom domain address",
      "Spam, virus & phishing filters",
      "Webmail + mobile apps",
      "Catch-all for mistyped addresses",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    bestFor: "Small teams ready to scale",
    original: "$1.99",
    off: "99% off",
    popular: true,
    mailboxes: "Up to 10 mailboxes",
    storage: "20 GB per mailbox",
    extras: "20 aliases · 20 forwards",
    features: [
      "Everything in Starter",
      "AI write, reply & summarize",
      "Open tracking on sends",
      "Priority inbox search",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    bestFor: "Teams that scale",
    original: "$2.99",
    off: "99% off",
    mailboxes: "Unlimited mailboxes",
    storage: "50 GB per mailbox",
    extras: "50 aliases · 50 forwards",
    features: [
      "Everything in Standard",
      "Free domain for 1 year",
      "Link & file-open tracking",
      "Shared inboxes & audit logs",
    ],
  },
];

const impressionTabs = [
  {
    id: "setup",
    label: "Set-up",
    title: "Easy setup and migration",
    body: "Connect Outlook, Gmail, and Apple Mail. Import folders and contacts — no DNS drama on our stack.",
    points: [
      "Connect to apps you already use",
      "Bring old mail with you in a few clicks",
      "Ready in minutes — no specialist required",
    ],
    image: "/images/business-email/migration.png",
    alt: "Team moving mailboxes onto HostingBeyond",
  },
  {
    id: "time",
    label: "Save time",
    title: "AI that writes in your voice",
    body: "Set your tone once. Drafts, replies, and summaries stay on-brand so you leave the inbox faster.",
    points: [
      "Personalized writing style",
      "Reply and summarize in seconds",
      "Search like you speak",
    ],
    image: "/images/business-email/ai-inbox.png",
    alt: "AI compose panel in HostingBeyond Mail",
  },
  {
    id: "scale",
    label: "Scale",
    title: "Look like a real company",
    body: "Every send carries you@yourbrand.com, a signature, and the same HostingBeyond account as your site.",
    points: [
      "Custom domain on every mailbox",
      "Signatures that match your card",
      "Add seats without switching vendors",
    ],
    image: "/images/business-email/signature.png",
    alt: "Branded card and phone showing a professional email",
  },
];

const included = [
  "Spam, virus, phishing protection",
  "Access email on any app or device",
  "Migrate mailboxes without an IT project",
  "Encrypted delivery & optional 2FA",
  "Auto-replies when you are away",
  "Forwarding and catch-all addresses",
  "Fast, clean webmail",
  "Audit-friendly mailbox activity",
];

const inboxRows = [
  {
    name: "Priya Shah",
    preview: "Invoice for Studio Apex — please review",
    time: "10:24",
    unread: true,
  },
  {
    name: "Marcus Chen",
    preview: "Re: launch checklist for Friday",
    time: "9:15",
  },
  {
    name: "Elena Rossi",
    preview: "Welcome to HostingBeyond Mail",
    time: "Yesterday",
  },
];

const faqs = [
  {
    q: "What is a business email address?",
    a: "It uses your own domain — like you@yourbrand.com — instead of a free inbox. Clients see your brand in every send.",
  },
  {
    q: "What is email hosting?",
    a: "Email hosting stores, sends, and receives mail on dedicated servers. HostingBeyond Mail works with or without a website on the same account.",
  },
  {
    q: "Why not a free Gmail or Outlook address?",
    a: "Clients trust a branded address more. You also keep work separate from personal mail and improve how messages land in the inbox.",
  },
  {
    q: "How much does HostingBeyond Mail cost?",
    a: "Every mailbox plan is $0.02 per month. Add storage or move up a plan as the team grows. 30-day money-back. Cancel anytime.",
  },
  {
    q: "How do I create a mailbox?",
    a: "Pick a plan, connect a domain you already own (or register one here), then choose a name and password. Webmail is ready immediately.",
  },
  {
    q: "Can I migrate my current inbox?",
    a: "Yes. Import mail, folders, and contacts from Gmail, Outlook, and most IMAP providers in a few clicks.",
  },
  {
    q: "Will it work on my phone?",
    a: "Use webmail in the browser or add the mailbox to Gmail, Outlook, Apple Mail, and Android.",
  },
  {
    q: "Is business email secure?",
    a: "Plans include spam and phishing filters, encrypted transport, and optional two-factor sign-in.",
  },
  {
    q: "Can I turn AI off?",
    a: "Yes. Writing, summaries, search assistance, and agents can be disabled per mailbox.",
  },
];

function LiveInbox({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="overflow-hidden rounded-[22px] border border-white/90 bg-white/95 shadow-[0_22px_50px_-22px_rgba(15,23,42,0.5)] backdrop-blur-xl"
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <p className="ml-1 inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-900">
          <Mail className="size-3 text-[#4f46e5]" />
          you@yourbrand.com
        </p>
      </div>
      <div className="space-y-1.5 p-2.5">
        {inboxRows.map((row, index) => (
          <motion.div
            key={row.name}
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * index }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-2 py-1.5",
              row.unread ? "bg-[#eef2ff]" : "bg-slate-50",
            )}
          >
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-[10px] font-bold text-white">
              {row.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-extrabold text-slate-900">
                {row.name}
              </span>
              <span className="block truncate text-[10px] text-slate-500">
                {row.preview}
              </span>
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              {row.time}
            </span>
          </motion.div>
        ))}
        <div className="rounded-xl border border-dashed border-indigo-200 bg-[#f8f7ff] px-2.5 py-2">
          <p className="text-[10px] font-bold tracking-wide text-[#4f46e5] uppercase">
            Beyond AI draft
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
            Thanks Priya — invoice looks good. Sending payment today.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function BusinessEmailPageView() {
  const reduce = useReducedMotion();
  const [openFaq, setOpenFaq] = useState(0);
  const [tab, setTab] = useState(impressionTabs[0].id);
  const activeTab =
    impressionTabs.find((item) => item.id === tab) ?? impressionTabs[0];

  return (
    <>
      <section className="hb-shell relative pt-8 pb-16 sm:pt-12 sm:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase shadow-sm">
              <Mail className="size-3.5 text-[#4f46e5]" />
              HostingBeyond Mail
            </p>
            <h1 className="font-heading mt-4 text-[clamp(2.15rem,5.2vw,4.25rem)] leading-[1.04] font-extrabold tracking-[-0.05em] text-slate-950">
              Business email that{" "}
              <span className="bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                builds trust
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-slate-600 sm:text-[17.5px]">
              Send from you@yourbrand.com — not a free inbox. AI writes with
              you. From {PRICE}/mo per mailbox.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#plans"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-5 text-[14.5px] font-bold text-white shadow-[0_14px_28px_rgba(79,70,229,0.32)]"
              >
                <Sparkles className="size-4" />
                Work faster with AI
              </Link>
              <Link
                href="#impression"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white bg-white/80 px-5 text-[14.5px] font-bold text-slate-800 shadow-sm"
              >
                Look professional
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-slate-600">
              <li className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> 30-day money-back
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> Cancel anytime
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> 24/7 support
              </li>
            </ul>
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-[560px] lg:max-w-none"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-hidden rounded-[32px] border border-white/80 shadow-[0_32px_80px_-28px_rgba(37,80,130,0.5)]">
              <Image
                src="/images/business-email/hero-professional.png"
                alt="Professional using HostingBeyond business email"
                width={1280}
                height={720}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 left-2 hidden w-[min(78%,340px)] sm:block lg:-left-8">
              <LiveInbox reduce={reduce} />
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="impression"
        className="hb-home-section hb-home-section--white"
      >
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase">
              Make the right impression
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.8rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-slate-950">
              Every send should look like{" "}
              <span className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent">
                your brand
              </span>
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {impressionTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-bold transition",
                    tab === item.id
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="mt-6 text-[1.25rem] font-extrabold text-slate-950">
                  {activeTab.title}
                </h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-slate-600">
                  {activeTab.body}
                </p>
                <ul className="mt-5 space-y-3">
                  {activeTab.points.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2.5 text-[14.5px] font-medium text-slate-700"
                    >
                      <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-[#e8f1ff] text-[#2563eb]">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#plans"
                  className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-extrabold text-[#4f46e5]"
                >
                  Choose plan
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.image}
              className="overflow-hidden rounded-[28px] border border-slate-100 shadow-[0_24px_60px_-32px_rgba(37,80,130,0.45)]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <Image
                src={activeTab.image}
                alt={activeTab.alt}
                width={1200}
                height={900}
                className="h-auto w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section id="plans" className="hb-home-section hb-home-section--sheet">
        <div className="hb-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase">
              Purchase your AI-powered plan
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.85rem)] font-extrabold tracking-[-0.04em] text-slate-950">
              From {PRICE}
              <span className="text-[1.15rem] font-bold text-slate-500">
                /mo
              </span>{" "}
              on every mailbox
            </h2>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                "30-day money-back",
                "Cancel anytime",
                "24/7 support",
                "Lowest rate on all plans",
              ].map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-3 py-1.5 text-[12px] font-bold text-slate-600 shadow-sm"
                >
                  <Check className="size-3.5 text-emerald-600" />
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={cn(
                  "relative flex h-full flex-col rounded-[26px] border bg-white p-6",
                  plan.popular
                    ? "border-indigo-200 shadow-[0_28px_60px_-28px_rgba(79,70,229,0.4)] ring-1 ring-indigo-100"
                    : "border-slate-200/90 shadow-[0_16px_40px_-28px_rgba(37,80,130,0.4)]",
                )}
              >
                <p className="absolute top-4 right-4 rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 uppercase">
                  {plan.off}
                </p>
                {plan.popular ? (
                  <p className="mb-3 inline-flex self-start rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#4f46e5] uppercase">
                    Most popular
                  </p>
                ) : (
                  <p className="mb-3 text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">
                    Mailbox plan
                  </p>
                )}
                <h3 className="font-heading text-[1.45rem] font-extrabold text-slate-950">
                  {plan.name}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  {plan.bestFor}
                </p>
                <p className="mt-4 text-[13px] text-slate-400 line-through">
                  {plan.original}
                </p>
                <p className="flex items-end gap-1">
                  <span className="text-[2.35rem] leading-none font-extrabold text-[#2563eb]">
                    {PRICE}
                  </span>
                  <span className="pb-1 text-[13px] font-semibold text-slate-500">
                    /mo
                  </span>
                </p>
                <p className="mt-2 text-[12.5px] text-slate-500">
                  {plan.mailboxes} · {plan.storage}
                </p>
                <p className="text-[12px] text-slate-400">{plan.extras}</p>
                <Link
                  href={routes.signup}
                  className={cn(
                    "mt-5 inline-flex h-11 items-center justify-center rounded-full text-[14px] font-bold",
                    plan.popular
                      ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white"
                      : "border border-slate-200 bg-white text-slate-800",
                  )}
                >
                  Choose plan
                </Link>
                <ul className="mt-5 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13.5px] text-slate-600"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-[#2563eb]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-[12.5px] text-slate-500">
            Price per mailbox. Same {PRICE}/mo on Starter, Standard, and
            Premium. Renews at the same rate until you change plan.
          </p>
        </div>
      </section>

      <section className="hb-home-section hb-home-section--white">
        <div className="hb-shell">
          <h2 className="font-heading text-center text-[clamp(1.55rem,3vw,2.4rem)] font-extrabold tracking-[-0.04em] text-slate-950">
            Every plan includes the essentials — and more
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item) => (
              <p
                key={item}
                className="flex items-start gap-2 rounded-[18px] border border-slate-100 bg-[#f7fbff] px-3.5 py-3 text-[13.5px] font-medium text-slate-700"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="hb-home-section hb-home-section--ice">
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            className="overflow-hidden rounded-[28px] border border-white shadow-[0_24px_60px_-32px_rgba(37,80,130,0.45)]"
            animate={reduce ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/images/business-email/ai-write.png"
              alt="AI helping write a professional email"
              width={1200}
              height={900}
              className="h-auto w-full"
            />
          </motion.div>
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase">
              <Bot className="size-3.5 text-[#7c3aed]" />
              Work smarter with AI
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.8rem)] font-extrabold tracking-[-0.04em] text-slate-950">
              Less inbox. More actual work.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Writes in your voice",
                  body: "Set your tone once. Drafts sound like you — not a generic bot.",
                  icon: Sparkles,
                },
                {
                  title: "Reply in seconds",
                  body: "Summarize a thread and send a clean answer without leaving mail.",
                  icon: Zap,
                },
                {
                  title: "Search like you speak",
                  body: "Ask for last week’s invoice. Find it — no folder hunting.",
                  icon: Search,
                },
                {
                  title: "Works with your apps",
                  body: "Outlook, Gmail, Apple Mail — keep the clients your team knows.",
                  icon: Inbox,
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="rounded-[20px] border border-white bg-white/80 p-4 shadow-sm"
                  >
                    <Icon className="size-5 text-[#4f46e5]" />
                    <h3 className="mt-2 text-[15px] font-extrabold text-slate-950">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-snug text-slate-500">
                      {card.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="hb-home-section hb-home-section--white">
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase">
              Bring your inbox with you
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.7rem,3.4vw,2.7rem)] font-extrabold tracking-[-0.04em] text-slate-950">
              Moving from Gmail or Outlook? Keep the history.
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-slate-600">
              Import mail, folders, and contacts almost instantly. Beyond Agent
              walks DNS and mailbox setup so you are not stuck in a panel.
            </p>
            <Link
              href={routes.signup}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-[14px] font-bold text-white"
            >
              Migrate mailbox
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-slate-100 shadow-[0_24px_60px_-32px_rgba(37,80,130,0.4)]">
            <Image
              src="/images/business-email/migration.png"
              alt="Professionals migrating business email"
              width={1200}
              height={675}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="hb-home-section hb-home-section--mist">
        <div className="hb-shell grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Stay private",
              body: "Encrypted delivery, phishing filters, and 2FA on the account.",
            },
            {
              icon: Lock,
              title: "One HostingBeyond login",
              body: "Domains, hosting, and mail in the same panel — not three vendors.",
            },
            {
              icon: Clock,
              title: "Live in minutes",
              body: "Create a mailbox, add DNS records we show you, start sending.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[24px] border border-white bg-white p-5"
              >
                <Icon className="size-6 text-[#2563eb]" />
                <h3 className="mt-3 text-[17px] font-extrabold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[14px] text-slate-600">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="hb-home-section hb-home-section--white">
        <div className="hb-shell mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-[clamp(1.6rem,3vw,2.5rem)] font-extrabold text-slate-950">
            Business email FAQs
          </h2>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "FAQPage",
                    mainEntity: faqs.map((item) => ({
                      "@type": "Question",
                      name: item.q,
                      acceptedAnswer: { "@type": "Answer", text: item.a },
                    })),
                  },
                  {
                    "@type": "Product",
                    name: "HostingBeyond Mail",
                    description:
                      "Professional business email on your domain with AI writing tools.",
                    offers: plans.map((plan) => ({
                      "@type": "Offer",
                      name: plan.name,
                      price: "0.02",
                      priceCurrency: "USD",
                      availability: "https://schema.org/InStock",
                    })),
                  },
                ],
              }),
            }}
          />
          <div className="mt-8 space-y-2">
            {faqs.map((item, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-[18px] border border-slate-100 bg-[#f7fbff]"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-[15px] font-bold text-slate-950"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    {item.q}
                    {open ? (
                      <Minus className="size-4 shrink-0" />
                    ) : (
                      <Plus className="size-4 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-[14px] leading-relaxed text-slate-600">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hb-home-section pb-20">
        <div className="hb-shell">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#1d4ed8] via-[#4f46e5] to-[#7c3aed] px-6 py-12 text-center text-white sm:px-10">
            <h2 className="font-heading text-[clamp(1.7rem,3.2vw,2.6rem)] font-extrabold tracking-[-0.04em]">
              Start today from {PRICE}/mo
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15.5px] text-white/85">
              Branded mail, AI drafts, and 24/7 support — on the same account as
              your hosting.
            </p>
            <Link
              href="#plans"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14.5px] font-extrabold text-slate-950"
            >
              Choose plan
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
