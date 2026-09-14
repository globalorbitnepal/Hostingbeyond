"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Bot,
  Check,
  Clock,
  Folder,
  Inbox,
  Mail,
  Paperclip,
  PenLine,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox, count: 4 },
  { id: "drafts", label: "Drafts", icon: PenLine },
  { id: "sent", label: "Sent", icon: Send },
  { id: "starred", label: "Starred", icon: Star },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "spam", label: "Spam", icon: Clock },
  { id: "trash", label: "Trash", icon: Trash2 },
  { id: "contacts", label: "Contacts", icon: Users },
];

const seedMail = [
  {
    id: "m1",
    from: "Sara Okator",
    email: "sara@studiopixel.com",
    subject: "Logo project — final files delivered",
    preview: "The final logo files are ready in PNG, SVG and PDF.",
    time: "Oct 23",
    unread: true,
    body: "Hi Tom,\n\nThe final logo files are ready. You’ll find SVG, PNG and PDF in the shared folder. Let me know if you need any adjustments.\n\nBest,\nSara Okator\nBrand Designer · sara@studiopixel.com",
  },
  {
    id: "m2",
    from: "Lucas Taylor",
    email: "lucas@northline.co",
    subject: "Re: revised quote for Phase 2",
    preview: "Updated numbers attached for the next sprint.",
    time: "Jun 3",
    unread: false,
    body: "Tom — revised quote is attached. Happy to jump on a call this week.",
  },
  {
    id: "m3",
    from: "Ethan Williams",
    email: "ethan@harbor.legal",
    subject: "Contract signed",
    preview: "Countersigned PDF is in this thread.",
    time: "10:12 AM",
    unread: true,
    starred: true,
    body: "Contract is countersigned. Filing copy on our side today.",
  },
  {
    id: "m4",
    from: "Sophia Johnson",
    email: "sophia@inbound.studio",
    subject: "Landing page feedback",
    preview: "A few notes on the hero and form.",
    time: "12:34 PM",
    unread: false,
    body: "Hero is strong. Let’s tighten the form copy before Friday.",
  },
];

const incoming = {
  id: "m-new",
  from: "Priya Shah",
  email: "priya@apex.studio",
  subject: "Invoice for Studio Apex",
  preview: "Please review the attached invoice for May.",
  time: "Now",
  unread: true,
  body: "Hi Tom,\n\nPlease review the attached invoice for May. Happy to hop on a call if anything looks off.\n\nPriya",
};

export function MailWorkspace() {
  const reduce = useReducedMotion();
  const [rows, setRows] = useState(seedMail);
  const [selected, setSelected] = useState(seedMail[0].id);
  const [phase, setPhase] = useState<
    "idle" | "compose" | "typing" | "sending" | "sent"
  >("idle");
  const [typed, setTyped] = useState("");
  const draft = "Thanks Priya — invoice looks good. Sending payment today.";

  const active = useMemo(
    () => rows.find((row) => row.id === selected) ?? rows[0],
    [rows, selected],
  );

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    const timers: number[] = [];

    const run = () => {
      if (cancelled) return;
      setRows(seedMail);
      setSelected(seedMail[0].id);
      setPhase("idle");
      setTyped("");

      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setRows((current) =>
            current.some((row) => row.id === incoming.id)
              ? current
              : [incoming, ...current],
          );
          setSelected(incoming.id);
          setPhase("compose");
        }, 1600),
      );
      timers.push(
        window.setTimeout(() => !cancelled && setPhase("typing"), 2600),
      );
      timers.push(
        window.setTimeout(() => !cancelled && setPhase("sending"), 6000),
      );
      timers.push(
        window.setTimeout(() => !cancelled && setPhase("sent"), 7400),
      );
    };

    run();
    const cycle = window.setInterval(run, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(cycle);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduce]);

  useEffect(() => {
    if (phase !== "typing" || reduce) {
      if (phase === "typing") setTyped(draft);
      return;
    }
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(draft.slice(0, i));
      if (i >= draft.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [phase, reduce]);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#f6f7fb] shadow-[0_40px_80px_-28px_rgba(0,0,0,0.65)]">
      <div className="flex items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <p className="ml-2 text-[12px] font-extrabold text-slate-800">
          HostingBeyond Mail
        </p>
        <div className="ml-auto hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-400 sm:flex">
          <Search className="size-3.5" />
          Search mail
        </div>
        <span className="hidden rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-extrabold text-[#4f46e5] sm:inline-flex">
          <Sparkles className="mr-1 size-3" />
          Ask AI
        </span>
      </div>

      <div className="grid min-h-[420px] lg:grid-cols-[148px_minmax(0,1fr)_minmax(0,1.05fr)]">
        <aside className="hidden border-r border-slate-200 bg-[#f3f0ff] p-3 lg:block">
          <button
            type="button"
            className="mb-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#673de6] text-[12px] font-bold text-white"
          >
            <PenLine className="size-3.5" />
            New message
          </button>
          {folders.map((item) => {
            const Icon = item.icon;
            const on = item.id === "inbox";
            return (
              <p
                key={item.id}
                className={cn(
                  "mb-0.5 flex items-center justify-between rounded-lg px-2 py-1.5 text-[11.5px] font-semibold",
                  on ? "bg-white text-slate-950 shadow-sm" : "text-slate-500",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  {item.label}
                </span>
                {item.count ? (
                  <span className="rounded-full bg-slate-900 px-1.5 text-[9px] text-white">
                    {item.count}
                  </span>
                ) : null}
              </p>
            );
          })}
          <p className="mt-4 px-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
            Folders
          </p>
          <p className="mt-1 flex items-center gap-1.5 px-2 text-[11px] text-slate-500">
            <Folder className="size-3.5" />
            Clients
          </p>
        </aside>

        <div className="border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between px-3 py-2 text-[12px] font-extrabold text-slate-900">
            Inbox
            <span className="text-[10px] font-semibold text-slate-400">
              All mail
            </span>
          </div>
          <div className="space-y-0.5 px-1.5 pb-2">
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <motion.button
                  key={row.id}
                  type="button"
                  layout
                  initial={reduce ? false : { opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  onClick={() => setSelected(row.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left",
                    selected === row.id ? "bg-[#eef2ff]" : "hover:bg-slate-50",
                  )}
                >
                  <span className="mt-1 size-3.5 rounded border border-slate-300" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-[12px]",
                          row.unread
                            ? "font-extrabold text-slate-950"
                            : "font-semibold text-slate-700",
                        )}
                      >
                        {row.from}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {row.time}
                      </span>
                    </span>
                    <span className="block truncate text-[11.5px] font-semibold text-slate-800">
                      {row.subject}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {row.preview}
                    </span>
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative hidden bg-white p-4 sm:block">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="max-w-[70%] text-[15px] leading-tight font-extrabold text-slate-950">
              {active.subject}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-[#f5f3ff] px-2 py-1 text-[10px] font-bold text-[#673de6]">
              <Bot className="size-3" />
              Summarize
            </span>
          </div>
          <p className="text-[12px] text-slate-500">
            From {active.from} · {active.email}
          </p>
          <p className="mt-4 text-[13px] leading-relaxed whitespace-pre-line text-slate-700">
            {active.body}
          </p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              className="rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-bold text-white"
            >
              Reply
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700"
            >
              Forward
            </button>
          </div>

          <AnimatePresence>
            {phase === "compose" ||
            phase === "typing" ||
            phase === "sending" ? (
              <motion.div
                key="compose"
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={
                  phase === "sending"
                    ? { opacity: 0, y: -80, scale: 0.6, x: 40 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={{ opacity: 0 }}
                className="absolute right-3 bottom-3 w-[min(100%-1.5rem,320px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.45)]"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-[11px] font-bold text-slate-800">
                  New message
                  <Mail className="size-3.5 text-[#673de6]" />
                </div>
                <div className="space-y-1 px-3 py-2 text-[11px] text-slate-500">
                  <p>
                    To:{" "}
                    <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 font-semibold text-slate-800">
                      priya@apex.studio
                    </span>
                  </p>
                  <p>
                    Subject:{" "}
                    <span className="font-semibold text-slate-800">
                      Re: Invoice for Studio Apex
                    </span>
                  </p>
                </div>
                <p className="min-h-[72px] px-3 pb-2 text-[12px] leading-relaxed text-slate-700">
                  {typed}
                  {phase === "typing" ? (
                    <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-[#673de6]" />
                  ) : null}
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#673de6]">
                    <Sparkles className="size-3" />
                    Written in your voice
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#673de6] px-2.5 py-1 text-[10px] font-bold text-white">
                    <Send className="size-3" />
                    {phase === "sending" ? "Sending…" : "Send"}
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "sent" ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"
              >
                <Check className="size-3.5" />
                Mail sent to priya@apex.studio
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <p className="pointer-events-none absolute -right-2 -bottom-8 hidden text-slate-200 lg:block">
        <Paperclip className="size-24 rotate-12 opacity-20" />
      </p>
    </div>
  );
}
