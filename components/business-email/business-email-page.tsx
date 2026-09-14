"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
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

import { MailWorkspace } from "@/components/business-email/mail-workspace";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "starter",
    name: "Starter",
    bestFor: "solo entrepreneurs",
    original: "$2.99",
    price: "$0.37",
    off: "88% off",
    renew: "$1.57",
    mailboxes: "1 mailbox included",
    storage: "5 GB storage per mailbox",
    extras: "5 forwarding rules · 5 email aliases",
    features: ["Agentic Mail", "Spam, virus & phishing protection"],
  },
  {
    id: "standard",
    name: "Standard",
    bestFor: "small businesses ready to scale",
    original: "$3.99",
    price: "$0.97",
    off: "76% off",
    renew: "$2.77",
    popular: true,
    mailboxes: "1 mailbox included",
    storage: "20 GB storage per mailbox",
    extras: "20 forwarding rules · 10 email aliases",
    features: [
      "Search, reply, summarize, and write with AI — unlimited",
      "See who opened your emails",
      "Smart AI-driven replies",
      "Agentic Mail",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    bestFor: "teams that scale",
    original: "$5.99",
    price: "$1.97",
    off: "67% off",
    renew: "$3.97",
    mailboxes: "1 mailbox included",
    storage: "50 GB storage per mailbox",
    extras: "50 forwarding rules · 30 email aliases",
    features: [
      "Free domain for 1 year",
      "Track link clicks and file opens",
      "Search, reply, summarize, and write with AI — unlimited",
      "See who opened your emails",
      "Agentic Mail",
    ],
  },
];

const included = [
  "Spam, virus, phishing protection",
  "Access email on any app or device",
  "Track mailbox activity with audit logs",
  "Keep data safe with encryption in transit",
  "Easily migrate your emails",
  "Set auto-replies when you are away",
  "Forward emails to any other address",
  "Catch emails sent to mistyped addresses",
  "Fast, clean, easy-to-use webmail",
];

const impressionTabs = [
  {
    id: "setup",
    label: "Set-up",
    title: "Easy setup and migration",
    points: [
      "Connect to email apps like Outlook, Gmail, and more",
      "Bring your old and current emails with you",
      "Ready in minutes — no specialist required",
    ],
    image: "/images/business-email/people/p-laptop.jpg",
    alt: "Team setting up business email on a laptop",
  },
  {
    id: "time",
    label: "Save time",
    title: "Write in your voice, not a template",
    points: [
      "Set tone once — Friendly, Professional, or Concise",
      "Drafts, replies, and summaries in a few seconds",
      "Search the inbox the way you speak",
    ],
    image: "/images/business-email/people/p-phone.jpg",
    alt: "People collaborating over a professional inbox",
  },
  {
    id: "scale",
    label: "Scale",
    title: "The inbox that scales with you",
    points: [
      "Up to 50 GB inbox space (or more if you need it)",
      "Send up to 3,000 emails per day",
      "Add and share extra storage across mailboxes",
    ],
    image: "/images/business-email/people/p-desk.jpg",
    alt: "Bright office ready for a growing team",
  },
  {
    id: "agents",
    label: "Agents",
    title: "Mail that works with your agents",
    points: [
      "Dedicated addresses for automations",
      "Webhooks when a message lands",
      "Allow and block lists for sender control",
    ],
    image: "/images/business-email/people/p-team.jpg",
    alt: "Team reviewing a branded mailbox together",
  },
];

const faqs = [
  {
    q: "What is a business email address?",
    a: "A custom business email uses your own domain — you@yourbrand.com — instead of a free provider. It helps you look professional and keep every send on-brand.",
  },
  {
    q: "What is email hosting?",
    a: "Email hosting stores, sends, and receives mail on dedicated servers. HostingBeyond Mail works with or without a website on the same account. Hosting plans can also include mailboxes.",
  },
  {
    q: "Why do I need a business email instead of a free email account?",
    a: "Clients are more likely to trust and reply to a branded address than a free inbox. You also keep work separate from personal mail and improve how messages land.",
  },
  {
    q: "How much does HostingBeyond Mail cost?",
    a: "Plans start at $0.37 per mailbox per month on a 48-month term. Standard is $0.97/mo and Premium is $1.97/mo. You can add storage or change plans as you grow.",
  },
  {
    q: "How do I create a business email address?",
    a: "Choose a plan, connect a domain you already own (or register one here), then pick a mailbox name and password. Webmail is ready as soon as DNS is in place.",
  },
  {
    q: "Can I migrate my existing emails?",
    a: "Yes. After you create a mailbox, import mail, folders, and contacts from Gmail, Outlook, and most IMAP providers in a few clicks.",
  },
  {
    q: "Will my business email work on mobile and with Gmail or Outlook?",
    a: "Use webmail in the browser, or add the mailbox to Gmail, Outlook, Apple Mail, and Android. Setup guides cover the common clients.",
  },
  {
    q: "Does HostingBeyond Mail provide backup and recovery?",
    a: "We recommend regular mailbox backups. Deleted items can be restored from trash within the retention window, and you can export mail anytime.",
  },
  {
    q: "Is business email hosting secure?",
    a: "Plans include spam and virus filters, encrypted transport, and optional two-factor sign-in.",
  },
  {
    q: "Can AI be disabled?",
    a: "Yes. Writing, replies, summaries, search assistance, and agents can be turned off per mailbox.",
  },
  {
    q: "Can I use HostingBeyond Mail with AI agents and automation tools?",
    a: "Yes. Agentic Mail gives automations a dedicated address, webhook triggers, and allow/block controls. It plugs into n8n, Make, Zapier, and similar tools.",
  },
];

const reviews = [
  {
    quote:
      "Domains, WordPress, and mail in one place — the rate is the reason we moved, the inbox is why we stayed.",
    name: "Amina Koirala",
    photo: "/images/business-email/people/p-woman.jpg",
  },
  {
    quote:
      "I need mail that just works: no outages, easy renewals, and a branded address clients actually trust.",
    name: "Daniel Mercer",
    photo: "/images/business-email/people/p-man.jpg",
  },
  {
    quote:
      "Setup took minutes. We imported years of Gmail history without hiring anyone.",
    name: "Sofia Alvarez",
    photo: "/images/business-email/people/p-woman2.jpg",
  },
];

export function BusinessEmailPageView() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState(impressionTabs[0].id);
  const [openFaq, setOpenFaq] = useState(0);
  const [term, setTerm] = useState("48");
  const active =
    impressionTabs.find((item) => item.id === tab) ?? impressionTabs[0];

  return (
    <>
      <section className="relative overflow-hidden bg-[#07070c] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(103,61,230,0.28),transparent_42%),radial-gradient(ellipse_at_90%_40%,rgba(37,99,235,0.18),transparent_40%)]"
        />
        <div className="hb-shell relative grid items-center gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:py-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[13px] font-bold tracking-wide text-[#c4b5fd]">
              HostingBeyond Mail
            </p>
            <h1 className="font-heading mt-3 text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1.02] font-extrabold tracking-[-0.05em]">
              Business email that builds trust
            </h1>
            <ul className="mt-6 space-y-2 text-[15px] text-white/80">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-400" />
                Work faster with built-in AI
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-400" />
                Look professional with a personal domain
              </li>
            </ul>
            <Link
              href="#pricing"
              className="mt-7 inline-flex h-12 items-center rounded-md bg-[#673de6] px-6 text-[15px] font-bold text-white shadow-[0_12px_30px_rgba(103,61,230,0.45)]"
            >
              Choose plan
            </Link>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-white/55">
              <Shield className="size-4" />
              30-day money-back guarantee
            </p>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <MailWorkspace />
          </motion.div>
        </div>
      </section>

      <section
        id="impression"
        className="relative overflow-hidden bg-[#1b1233] py-16 text-white sm:py-20"
      >
        <div className="hb-shell">
          <h2 className="font-heading text-center text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold tracking-[-0.045em]">
            Make the right impression
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[16px] leading-relaxed text-white/70">
            Every email you send says something about your business. Stand out
            with your own domain and a signature that reflects your brand.
          </p>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                {impressionTabs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-[13px] font-bold",
                      tab === item.id
                        ? "bg-white text-slate-950"
                        : "bg-white/10 text-white/80",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <h3 className="mt-7 text-[clamp(1.5rem,3vw,2.15rem)] font-extrabold">
                    {active.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {active.points.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-2 text-[15px] text-white/80"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#pricing"
                    className="mt-7 inline-flex h-11 items-center rounded-md bg-[#673de6] px-5 text-[14px] font-bold"
                  >
                    Choose plan
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[380px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.image}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.45 }}
                  className="overflow-hidden rounded-[28px]"
                >
                  <Image
                    src={active.image}
                    alt={active.alt}
                    width={1400}
                    height={933}
                    className="h-[420px] w-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <motion.div
                className="absolute top-6 -left-4 max-w-[230px] rounded-2xl border border-white/15 bg-[#2a2150]/95 p-3 shadow-2xl backdrop-blur"
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <p className="text-[10px] font-bold tracking-wide text-white/50 uppercase">
                  New message
                </p>
                <p className="mt-1 text-[12px] font-semibold">
                  To: jessica@portal.co
                </p>
                <p className="text-[12px] text-white/70">
                  Following up on our proposal
                </p>
                <span className="mt-2 inline-flex rounded-full bg-[#673de6] px-2 py-0.5 text-[10px] font-bold">
                  Sending
                </span>
              </motion.div>
              <motion.div
                className="absolute right-2 bottom-8 max-w-[210px] rounded-2xl border border-white/15 bg-white p-3 text-slate-900 shadow-2xl"
                animate={reduce ? undefined : { y: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <p className="text-[11px] font-extrabold">
                  Manage your writing style
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Casual", "Professional", "Friendly", "Concise"].map(
                    (tone) => (
                      <span
                        key={tone}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          tone === "Professional"
                            ? "bg-[#673de6] text-white"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {tone}
                      </span>
                    ),
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#f4f8fd] py-16 sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading text-center text-[clamp(1.85rem,3.6vw,2.9rem)] font-extrabold tracking-[-0.04em] text-slate-950">
            Purchase your AI-powered business email plan
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-emerald-600" />
              30-day money-back guarantee
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-emerald-600" />
              Cancel anytime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-emerald-600" />
              24/7 support
            </span>
          </div>
          <div className="mt-6 flex justify-center">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700">
              Period
              <select
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                className="bg-transparent font-bold text-slate-950 outline-none"
              >
                <option value="48">48 months</option>
                <option value="24">24 months</option>
                <option value="12">12 months</option>
              </select>
            </label>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.id}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex flex-col rounded-[28px] border bg-white p-6",
                  plan.popular
                    ? "border-[#d9d1ff] shadow-[0_24px_60px_-28px_rgba(103,61,230,0.45)] ring-1 ring-[#ece7ff]"
                    : "border-slate-200",
                )}
              >
                <span className="absolute top-5 right-5 rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                  {plan.off}
                </span>
                {plan.popular ? (
                  <p className="mb-3 text-[11px] font-extrabold tracking-wide text-[#673de6] uppercase">
                    Most popular
                  </p>
                ) : (
                  <p className="mb-3 h-[17px]" />
                )}
                <h3 className="font-heading text-[1.7rem] font-extrabold text-slate-950">
                  {plan.name}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500">
                  Best for: {plan.bestFor}
                </p>
                <p className="mt-5 text-[14px] text-slate-400 line-through">
                  {plan.original}
                </p>
                <p className="flex items-end gap-1">
                  <span className="text-[2.6rem] leading-none font-extrabold text-slate-950">
                    {term === "12"
                      ? plan.renew
                      : term === "24"
                        ? plan.id === "starter"
                          ? "$0.67"
                          : plan.id === "standard"
                            ? "$1.47"
                            : "$2.47"
                        : plan.price}
                  </span>
                  <span className="pb-1 text-[14px] font-semibold text-slate-500">
                    /mo
                  </span>
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                  Price per mailbox. For {term}-month term. Renews at{" "}
                  {plan.renew}
                  /mo for 48-month term.
                </p>
                <p className="mt-4 text-[13.5px] font-semibold text-slate-700">
                  {plan.mailboxes}
                </p>
                <p className="text-[13.5px] text-slate-600">{plan.storage}</p>
                <p className="text-[13px] text-slate-500">{plan.extras}</p>
                <Link
                  href={routes.signup}
                  className={cn(
                    "mt-5 inline-flex h-11 items-center justify-center rounded-md text-[14px] font-bold",
                    plan.popular
                      ? "bg-[#673de6] text-white"
                      : "border border-slate-200 text-slate-900",
                  )}
                >
                  Choose plan
                </Link>
                <p className="mt-5 text-[12px] font-bold tracking-wide text-slate-400 uppercase">
                  Benefits
                </p>
                <ul className="mt-2 space-y-2">
                  {plan.features.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-[13.5px] text-slate-600"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-[#673de6]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>

          <h3 className="font-heading mt-14 text-center text-[1.45rem] font-extrabold text-slate-950">
            Every plan has everything you need and more
          </h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((item) => (
              <p
                key={item}
                className="flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-[14px] font-medium text-slate-700"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
          <p className="mt-6 text-center text-[12.5px] text-slate-500">
            All plans are paid upfront. The monthly rate reflects the total plan
            price divided by the number of months in your plan.
          </p>
        </div>
      </section>

      <section className="bg-[#1b1233] py-16 text-white sm:py-20">
        <div className="hb-shell">
          <p className="text-center text-[12px] font-bold tracking-[0.2em] text-[#c4b5fd] uppercase">
            Save time
          </p>
          <h2 className="font-heading mt-3 text-center text-[clamp(2rem,4vw,3.1rem)] font-extrabold">
            Work smarter with AI
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <article className="rounded-[28px] bg-[#2a2150] p-6">
              <div className="flex min-h-[160px] flex-wrap content-center gap-2">
                {["Friendly", "Professional", "Concise"].map((tone, i) => (
                  <motion.span
                    key={tone}
                    animate={
                      reduce ? undefined : { y: [0, i === 1 ? -8 : 6, 0] }
                    }
                    transition={{ duration: 3 + i, repeat: Infinity }}
                    className={cn(
                      "rounded-full px-4 py-2 text-[14px] font-bold",
                      tone === "Professional"
                        ? "bg-white text-[#673de6]"
                        : "bg-white/10",
                    )}
                  >
                    {tone === "Professional" ? `✓ ${tone}` : tone}
                  </motion.span>
                ))}
              </div>
              <h3 className="mt-4 text-[1.2rem] font-extrabold">
                Personalized AI
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                Describe your tone and style — just once. It remembers and
                writes like you every time.
              </p>
            </article>
            <article className="rounded-[28px] bg-[#2a2150] p-6">
              <div className="relative min-h-[160px]">
                <div className="space-y-2 opacity-40">
                  <p className="h-8 rounded-full bg-white/10" />
                  <p className="h-8 rounded-full bg-white/10" />
                  <p className="h-8 rounded-full bg-white/10" />
                </div>
                <motion.p
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-[14px] font-bold text-slate-900"
                  animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  ✦ Accept Thursday
                </motion.p>
              </div>
              <h3 className="mt-4 text-[1.2rem] font-extrabold">
                Write & reply in seconds
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                AI writes, replies, and summarizes so you spend less time in the
                inbox.
              </p>
            </article>
            <article className="rounded-[28px] bg-[#2a2150] p-6">
              <div className="flex min-h-[160px] items-center justify-center">
                <motion.div
                  className="flex w-full items-center gap-2 rounded-full bg-white/10 px-4 py-3"
                  animate={reduce ? undefined : { x: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  <Search className="size-4" />
                  <span className="text-[13px] text-white/70">
                    invoice from last week
                  </span>
                </motion.div>
              </div>
              <h3 className="mt-4 text-[1.2rem] font-extrabold">
                Search like you speak
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                Find any email instantly. No scrolling, no getting lost.
              </p>
            </article>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="#pricing"
              className="inline-flex h-11 items-center rounded-md bg-[#673de6] px-6 text-[14px] font-bold"
            >
              Choose plan
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading text-center text-[clamp(1.8rem,3.4vw,2.7rem)] font-extrabold tracking-[-0.04em] text-slate-950">
            Bring your favorite AI assistant into your inbox
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <article className="rounded-[28px] border border-slate-200 p-6">
              <p className="text-[12px] font-bold tracking-wide text-[#673de6] uppercase">
                ChatGPT
              </p>
              <h3 className="mt-2 text-[1.35rem] font-extrabold text-slate-950">
                HostingBeyond Mail for ChatGPT
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                Add the Mail app in ChatGPT and manage the inbox without leaving
                the chat. Summarize unread mail, find last week’s thread, or
                send a reply from the conversation.
              </p>
              <Link
                href={routes.beyondAi}
                className="mt-5 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#673de6]"
              >
                Install app
                <ArrowRight className="size-4" />
              </Link>
            </article>
            <article className="rounded-[28px] border border-slate-200 p-6">
              <p className="text-[12px] font-bold tracking-wide text-[#673de6] uppercase">
                Claude
              </p>
              <h3 className="mt-2 text-[1.35rem] font-extrabold text-slate-950">
                HostingBeyond Mail for Claude
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                Link the mailbox through the official connector and let Claude
                read, send, and manage mail from the conversation.
              </p>
              <Link
                href={routes.beyondAi}
                className="mt-5 inline-flex items-center gap-1 text-[14px] font-extrabold text-[#673de6]"
              >
                Connect to Claude
                <ArrowRight className="size-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f8fd] py-16 sm:py-20">
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold tracking-[-0.04em] text-slate-950">
              Bring your inbox with you
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              Moving from another provider? Import emails, folders, and contacts
              almost instantly with Beyond Agent — your mailbox assistant.
            </p>
            <Link
              href={routes.signup}
              className="mt-6 inline-flex h-11 items-center rounded-md bg-[#673de6] px-5 text-[14px] font-bold text-white"
            >
              Migrate mailbox
            </Link>
          </div>
          <div className="overflow-hidden rounded-[28px]">
            <Image
              src="/images/business-email/people/p-team.jpg"
              alt="Team migrating mailboxes together"
              width={1400}
              height={933}
              className="h-[340px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="hb-shell grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[28px]">
            <Image
              src="/images/business-email/people/p-laptop.jpg"
              alt="Marketers reviewing campaign results"
              width={1400}
              height={933}
              className="h-[340px] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold tracking-[-0.04em] text-slate-950">
              Go even further with email marketing
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              Already have the inbox? Send campaigns, grow the list, and track
              performance with Beyond Reach — the marketing tool that sits next
              to HostingBeyond Mail.
            </p>
            <Link
              href={routes.beyondAi}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 px-5 text-[14px] font-bold text-slate-900"
            >
              Explore Reach
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#07070c] py-16 text-white sm:py-20">
        <div className="hb-shell">
          <h2 className="font-heading text-center text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold">
            Join founders who switched their inbox
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reviews.map((item) => (
              <article
                key={item.name}
                className="rounded-[24px] bg-white/5 p-5 ring-1 ring-white/10"
              >
                <p className="text-[15px] leading-relaxed text-white/80">
                  “{item.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="relative size-11 overflow-hidden rounded-full">
                    <Image
                      src={item.photo}
                      alt=""
                      fill
                      className="object-cover object-top"
                    />
                  </span>
                  <p className="text-[14px] font-bold">{item.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="hb-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Sparkles,
              title: "Set up services",
              body: "Connect domains and configure DNS without a ticket.",
            },
            {
              icon: Zap,
              title: "Fix common issues",
              body: "Beyond Agent walks technical steps in the panel.",
            },
            {
              icon: Clock,
              title: "Launch faster",
              body: "Mailbox and site in the same account, same login.",
            },
            {
              icon: Lock,
              title: "Human backup",
              body: "24/7 support when the agent should hand off.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[22px] border border-slate-200 p-5"
              >
                <Icon className="size-6 text-[#673de6]" />
                <h3 className="mt-3 text-[16px] font-extrabold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[14px] text-slate-600">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#f4f8fd] py-16 sm:py-20">
        <div className="hb-shell mx-auto max-w-3xl">
          <h2 className="font-heading text-center text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold text-slate-950">
            Business email FAQs
          </h2>
          <p className="mt-2 text-center text-[15px] text-slate-500">
            Answers about creating and managing a professional mailbox.
          </p>
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
                    offers: [
                      {
                        "@type": "Offer",
                        name: "Starter",
                        price: "0.37",
                        priceCurrency: "USD",
                      },
                      {
                        "@type": "Offer",
                        name: "Standard",
                        price: "0.97",
                        priceCurrency: "USD",
                      },
                      {
                        "@type": "Offer",
                        name: "Premium",
                        price: "1.97",
                        priceCurrency: "USD",
                      },
                    ],
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
                  className="overflow-hidden rounded-[16px] bg-white"
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

      <section className="bg-[#673de6] py-16 text-center text-white">
        <div className="hb-shell">
          <h2 className="font-heading text-[clamp(1.8rem,3.4vw,2.7rem)] font-extrabold">
            Start today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-white/85">
            Get branded business email running now. Grow with AI tools and 24/7
            support — from $0.37/mo.
          </p>
          <Link
            href="#pricing"
            className="mt-7 inline-flex h-12 items-center rounded-md bg-white px-6 text-[15px] font-extrabold text-slate-950"
          >
            Choose plan
          </Link>
        </div>
      </section>
    </>
  );
}
