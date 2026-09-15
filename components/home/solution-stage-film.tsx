"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Check,
  Globe2,
  Mail,
  Server,
  Shield,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type Props = {
  id: string;
  playing?: boolean;
};

export function SolutionStageFilm({ id, playing = true }: Props) {
  const reduce = useReducedMotion();
  const on = playing && !reduce;

  if (id === "ecommerce-hosting") return <CommerceFilm playing={on} />;
  if (id === "business-email") return <MailFilm playing={on} />;
  if (id === "vps") return <VpsFilm playing={on} />;
  if (id === "domains") return <DomainFilm playing={on} />;
  if (id === "cloud-hosting") return <CloudFilm playing={on} />;
  if (id === "wordpress-hosting") return <WordpressFilm playing={on} />;
  if (id === "reseller-hosting") return <ResellerFilm playing={on} />;
  return <WebFilm playing={on} />;
}

function Stage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-8 bottom-[3.35rem] z-10 overflow-hidden bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

function WebFilm({ playing }: { playing: boolean }) {
  return (
    <Stage>
      <div className="flex h-full flex-col bg-[#f7f8ff]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3 py-1.5">
          <span className="text-[10px] font-extrabold tracking-tight text-[#2f1c6a]">
            HostingBeyond
          </span>
          <span className="flex gap-2 text-[8px] font-bold text-slate-400">
            Hosting <span>Email</span> <span>AI</span>
          </span>
          <span className="rounded-full bg-[#673de6] px-2 py-0.5 text-[8px] font-extrabold text-white">
            Go live
          </span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1.05fr_1fr] gap-2 p-2">
          <div className="flex flex-col justify-center px-1">
            <p className="text-[8px] font-extrabold tracking-[0.16em] text-[#673de6] uppercase">
              Live in 2 minutes
            </p>
            <p className="mt-1 text-[13px] leading-4 font-extrabold tracking-tight text-[#0c1a36] sm:text-[15px]">
              Studio site, published.
            </p>
            <p className="mt-1 line-clamp-2 text-[9px] leading-snug text-slate-500">
              NVMe hosting, free SSL and a custom domain on day one.
            </p>
            <div className="mt-2 flex gap-1">
              <span className="rounded-full bg-[#673de6] px-2 py-1 text-[8px] font-extrabold text-white">
                Visit site
              </span>
              <span className="rounded-full bg-white px-2 py-1 text-[8px] font-bold text-[#2f1c6a] ring-1 ring-slate-200">
                Edit
              </span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl shadow-[0_12px_24px_rgba(47,28,106,0.18)] ring-1 ring-white">
            <Image
              src="/images/home/solutions/web-hero.png"
              alt=""
              fill
              sizes="220px"
              className={cn(
                "object-cover",
                playing ? "hb-video-card" : "scale-105",
              )}
            />
            <span className="absolute top-1.5 left-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[7px] font-extrabold text-white">
              SSL · Live
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 border-t border-slate-100 bg-white px-2 py-1.5">
          {[
            { icon: Zap, label: "NVMe" },
            { icon: Shield, label: "Free SSL" },
            { icon: Globe2, label: "CDN" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-1 rounded-lg bg-[#f4f5ff] px-1.5 py-1"
              animate={playing ? { y: [4, 0], opacity: [0.55, 1] } : { y: 0 }}
              transition={{
                duration: 1.8,
                delay: index * 0.15,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              <item.icon className="size-3 text-[#673de6]" />
              <span className="text-[8px] font-extrabold text-[#2f1c6a]">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

function CommerceFilm({ playing }: { playing: boolean }) {
  const items = [
    {
      name: "Studio Can",
      price: "$25",
      src: "/images/journey/product-classic.png",
    },
    {
      name: "Citrus Blend",
      price: "$30",
      src: "/images/journey/product-can-citrus.png",
    },
    {
      name: "Berry Fizz",
      price: "$35",
      src: "/images/journey/product-can-berry.png",
    },
  ];
  const [picked, setPicked] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setPicked((value) => (value + 1) % items.length),
      2200,
    );
    return () => window.clearInterval(timer);
  }, [playing, items.length]);

  return (
    <Stage>
      <div className="flex h-full bg-[#f6f3ff]">
        <div className="relative w-[42%] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={items[picked].src}
              className="absolute inset-0"
              initial={playing ? { opacity: 0.35, scale: 1.06 } : false}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Image
                src={items[picked].src}
                alt=""
                fill
                sizes="180px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <span className="absolute top-2 left-2 rounded-full bg-white/92 px-1.5 py-0.5 text-[8px] font-extrabold text-emerald-600">
            In stock
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-2">
          <p className="flex items-center gap-1 text-[8px] font-extrabold tracking-[0.14em] text-[#673de6] uppercase">
            <ShoppingBag className="size-3" />
            yourshop.com
          </p>
          <div className="mt-1.5 flex min-h-0 flex-1 flex-col gap-1">
            {items.map((item, index) => {
              const selected = index === picked;
              return (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center gap-2 rounded-xl bg-white px-2 py-1 ring-1",
                    selected ? "ring-[#673de6]/50" : "ring-slate-100",
                  )}
                >
                  <span className="relative size-8 overflow-hidden rounded-lg bg-[#f4f5ff]">
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-extrabold text-[#0c1a36]">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-extrabold text-[#673de6]">
                      {item.price}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[7px] font-extrabold text-white",
                      selected ? "bg-emerald-500" : "bg-[#673de6]",
                    )}
                  >
                    {selected ? "Booked" : "Add"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Stage>
  );
}

function MailFilm({ playing }: { playing: boolean }) {
  const mails = [
    {
      from: "Sara Okator",
      subject: "Logo files delivered",
      preview: "SVG, PNG and PDF are in the folder.",
    },
    {
      from: "Lucas Taylor",
      subject: "Phase 2 quote",
      preview: "Updated numbers for the next sprint.",
    },
    {
      from: "Priya Shah",
      subject: "Invoice · Studio Apex",
      preview: "Please review the attached invoice.",
    },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % mails.length),
      2400,
    );
    return () => window.clearInterval(timer);
  }, [playing, mails.length]);

  const open = mails[active];

  return (
    <Stage>
      <div className="flex h-full bg-white">
        <div className="w-[4.4rem] shrink-0 space-y-1 border-r border-slate-100 bg-[#f4f5ff] p-1.5">
          {["Inbox", "Sent", "Star"].map((label, index) => (
            <span
              key={label}
              className={cn(
                "block rounded-md px-1.5 py-1 text-[8px] font-bold",
                index === 0
                  ? "bg-white text-[#673de6] shadow-sm"
                  : "text-slate-400",
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="w-[42%] min-w-0 border-r border-slate-100">
          <p className="flex items-center gap-1 border-b border-slate-100 px-2 py-1.5 text-[8px] font-extrabold text-slate-400 uppercase">
            <Mail className="size-3 text-[#673de6]" />
            you@yourbrand.com
          </p>
          {mails.map((mail, index) => (
            <div
              key={mail.subject}
              className={cn(
                "border-b border-slate-50 px-2 py-1.5",
                index === active && "bg-[#f4f5ff]",
              )}
            >
              <p className="truncate text-[9px] font-extrabold text-[#2f1c6a]">
                {mail.from}
              </p>
              <p className="truncate text-[8px] text-slate-500">
                {mail.subject}
              </p>
            </div>
          ))}
        </div>
        <motion.div
          key={open.subject}
          className="min-w-0 flex-1 p-2"
          initial={playing ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[11px] font-extrabold text-[#0c1a36]">
            {open.subject}
          </p>
          <p className="mt-0.5 text-[8px] text-slate-400">{open.from}</p>
          <p className="mt-2 text-[9px] leading-4 text-slate-600">
            {open.preview}
          </p>
          <span className="mt-3 inline-flex rounded-full bg-[#673de6] px-2 py-1 text-[8px] font-extrabold text-white">
            Reply
          </span>
        </motion.div>
      </div>
    </Stage>
  );
}

function VpsFilm({ playing }: { playing: boolean }) {
  const lines = [
    "root@vps:~# systemctl status nginx",
    "● nginx.service — active (running)",
    "Loaded: enabled   Memory: 184M",
    "ssh keys synced · region FRA-1",
  ];
  const [count, setCount] = useState(playing ? 1 : lines.length);

  useEffect(() => {
    if (!playing) {
      setCount(lines.length);
      return;
    }
    const timer = window.setInterval(() => {
      setCount((value) => (value >= lines.length ? 1 : value + 1));
    }, 1100);
    return () => window.clearInterval(timer);
  }, [playing, lines.length]);

  return (
    <Stage className="bg-[#0b1020]">
      <div className="grid h-full grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col border-r border-white/10 p-2.5 font-mono text-[10px] text-emerald-300 sm:text-[11px]">
          <p className="mb-2 flex items-center gap-1.5 font-sans text-[8px] font-extrabold tracking-[0.16em] text-violet-200 uppercase">
            <Server className="size-3" />
            Isolated VPS · FRA-1
          </p>
          {lines.slice(0, count).map((line) => (
            <p key={line} className="leading-5">
              {line}
            </p>
          ))}
          {playing ? (
            <span className="hb-caret mt-1 inline-block h-3 w-[7px] bg-emerald-300" />
          ) : null}
        </div>
        <div className="space-y-1.5 bg-[#111827] p-2">
          {[
            { label: "CPU", value: 34 },
            { label: "RAM", value: 52 },
            { label: "NVMe", value: 71 },
          ].map((row, index) => (
            <div
              key={row.label}
              className="rounded-lg bg-white/6 p-1.5 ring-1 ring-white/10"
            >
              <div className="flex justify-between text-[8px] font-bold text-slate-300">
                <span>{row.label}</span>
                <span>{row.value}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.span
                  className="block h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#34d399]"
                  animate={
                    playing
                      ? { width: [`${row.value - 12}%`, `${row.value + 8}%`] }
                      : { width: `${row.value}%` }
                  }
                  transition={{
                    duration: 2.2 + index * 0.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                />
              </div>
            </div>
          ))}
          <p className="rounded-lg bg-emerald-500/15 px-2 py-1 text-center text-[8px] font-extrabold text-emerald-300">
            Healthy · 99.99%
          </p>
        </div>
      </div>
    </Stage>
  );
}

function DomainFilm({ playing }: { playing: boolean }) {
  const rows = [
    { host: "yourbrand.com", ok: true, price: "$7.99" },
    { host: "yourbrand.io", ok: true, price: "$32" },
    { host: "yourbrand.net", ok: false, price: "Taken" },
  ];
  const [ready, setReady] = useState(!playing);

  useEffect(() => {
    if (!playing) {
      setReady(true);
      return;
    }
    const timer = window.setInterval(() => setReady((value) => !value), 2400);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <Stage>
      <div className="flex h-full flex-col bg-white p-2.5">
        <div className="flex overflow-hidden rounded-xl ring-1 ring-slate-200">
          <p className="flex-1 px-2.5 py-1.5 text-[11px] font-extrabold text-[#0c1a36]">
            yourbrand
            <span className="hb-caret ml-0.5 inline-block h-[1em] w-[2px] bg-[#673de6] align-[-2px]" />
          </p>
          <span className="bg-[#f4f5ff] px-2.5 py-1.5 text-[11px] font-extrabold text-[#673de6]">
            .com
          </span>
        </div>
        <div className="mt-2 space-y-1">
          {rows.map((row) => (
            <div
              key={row.host}
              className="flex items-center justify-between rounded-xl bg-[#f7f8ff] px-2.5 py-1.5"
            >
              <span className="text-[10px] font-bold text-[#2f1c6a]">
                {row.host}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${row.host}-${ready}`}
                  initial={playing ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[8px] font-extrabold",
                    row.ok && ready
                      ? "bg-emerald-500 text-white"
                      : row.ok
                        ? "bg-white text-[#673de6] ring-1 ring-slate-200"
                        : "bg-slate-200 text-slate-500",
                  )}
                >
                  {row.ok
                    ? ready
                      ? `Available · ${row.price}`
                      : "Checking…"
                    : row.price}
                </motion.span>
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

function CloudFilm({ playing }: { playing: boolean }) {
  const nodes = [
    { label: "NYC", x: "18%", y: "42%" },
    { label: "FRA", x: "48%", y: "34%" },
    { label: "SIN", x: "78%", y: "58%" },
    { label: "SYD", x: "86%", y: "78%" },
  ];
  const [hot, setHot] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setHot((value) => (value + 1) % nodes.length),
      1500,
    );
    return () => window.clearInterval(timer);
  }, [playing, nodes.length]);

  return (
    <Stage className="bg-[#0f172a]">
      <div className="grid h-full grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-1.5 border-r border-white/10 p-2">
          <p className="flex items-center gap-1 text-[8px] font-extrabold tracking-[0.14em] text-violet-200 uppercase">
            <Globe2 className="size-3" />
            Cloud control
          </p>
          {[
            { label: "Instances", value: "12" },
            { label: "Latency", value: "12 ms" },
            { label: "Traffic", value: "+38%" },
            { label: "Uptime", value: "99.99%" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg bg-white/8 px-2 py-1.5 ring-1 ring-white/10"
            >
              <p className="text-[8px] text-slate-400">{card.label}</p>
              <p className="text-[12px] font-extrabold text-white">
                {card.value}
              </p>
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-2 rounded-xl bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.45),rgba(15,10,40,0.2))]" />
          {nodes.map((node, index) => (
            <motion.span
              key={node.label}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: node.x, top: node.y }}
              animate={
                playing && index === hot ? { scale: [1, 1.2, 1] } : { scale: 1 }
              }
            >
              <span
                className={cn(
                  "size-2.5 rounded-full ring-4",
                  index === hot
                    ? "bg-white ring-[#673de6]/55"
                    : "bg-sky-300 ring-white/20",
                )}
              />
              <span className="mt-0.5 text-[8px] font-bold text-white">
                {node.label}
              </span>
            </motion.span>
          ))}
        </div>
      </div>
    </Stage>
  );
}

function WordpressFilm({ playing }: { playing: boolean }) {
  const [progress, setProgress] = useState(playing ? 22 : 100);

  useEffect(() => {
    if (!playing) {
      setProgress(100);
      return;
    }
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 100 ? 18 : value + 14));
    }, 480);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <Stage>
      <div className="flex h-full">
        <div className="flex w-10 shrink-0 flex-col items-center gap-2 bg-[#1d2327] py-2 text-white/70">
          <span className="text-[11px] font-black text-white">W</span>
          <span className="size-4 rounded bg-white/15" />
          <span className="size-4 rounded bg-white/15" />
          <span className="size-4 rounded bg-white/15" />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-[0.9fr_1.1fr]">
          <div className="border-r border-slate-100 p-2">
            <p className="text-[8px] font-extrabold tracking-[0.14em] text-slate-400 uppercase">
              Plugins
            </p>
            <p className="mt-1 text-[12px] font-extrabold text-[#0c1a36]">
              WooCommerce
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <motion.span
                className="block h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6]"
                animate={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[8px] font-bold text-[#673de6]">
              {Math.min(progress, 100)}% installing
            </p>
            <div className="mt-2 space-y-1">
              {["LiteSpeed cache", "Free SSL", "Auto updates"].map((row) => (
                <p
                  key={row}
                  className="flex items-center gap-1 rounded-lg bg-[#f4f5ff] px-1.5 py-1 text-[8px] font-bold text-[#2f1c6a]"
                >
                  <Check className="size-3 text-emerald-500" />
                  {row}
                </p>
              ))}
            </div>
          </div>
          <div className="relative bg-[#f7f8ff] p-2">
            <div className="h-full overflow-hidden rounded-lg bg-white ring-1 ring-slate-100">
              <div className="h-5 bg-gradient-to-r from-[#2563eb] to-[#673de6]" />
              <div className="space-y-1 p-2">
                <p className="text-[10px] font-extrabold text-[#0c1a36]">
                  Shop preview
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <span className="h-10 rounded-md bg-[#ede9fe]" />
                  <span className="h-10 rounded-md bg-[#dbeafe]" />
                </div>
                <motion.span
                  className="block h-6 rounded-md bg-[#673de6]"
                  animate={
                    playing ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }
                  }
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

function ResellerFilm({ playing }: { playing: boolean }) {
  const plans = [
    { name: "Starter", price: "$2.99", sites: "1 site" },
    { name: "Business", price: "$5.99", sites: "50 sites" },
    { name: "Agency", price: "$9.99", sites: "Unmetered" },
  ];
  const clients = [
    { name: "Northline Co", plan: "Business" },
    { name: "Harbor Legal", plan: "Agency" },
    { name: "Studio Pixel", plan: "Starter" },
  ];
  const [hot, setHot] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setHot((value) => (value + 1) % plans.length),
      2000,
    );
    return () => window.clearInterval(timer);
  }, [playing, plans.length]);

  return (
    <Stage>
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5">
          <p className="text-[9px] font-extrabold text-[#2f1c6a]">
            Your brand panel
          </p>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-extrabold text-emerald-600">
            White-label
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 px-2 pt-2">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={cn(
                "rounded-xl p-1.5 ring-1",
                index === hot
                  ? "bg-[#673de6] text-white ring-[#673de6]"
                  : "bg-[#f7f8ff] text-[#2f1c6a] ring-slate-100",
              )}
              animate={playing && index === hot ? { y: [-3, 0] } : { y: 0 }}
            >
              <p className="text-[8px] font-bold">{plan.name}</p>
              <p className="text-[12px] font-extrabold">{plan.price}</p>
              <p className="text-[7px] opacity-80">{plan.sites}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-1.5 min-h-0 flex-1 space-y-1 px-2 pb-2">
          {clients.map((client) => (
            <div
              key={client.name}
              className="flex items-center justify-between rounded-lg bg-[#f4f5ff] px-2 py-1"
            >
              <span className="text-[9px] font-bold text-[#0c1a36]">
                {client.name}
              </span>
              <span className="text-[8px] font-extrabold text-[#673de6]">
                {client.plan}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
}
