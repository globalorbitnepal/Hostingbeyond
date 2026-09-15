"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Globe2, Server, ShoppingBag } from "lucide-react";
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

function StageGlass({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-3 top-10 bottom-[3.65rem] z-10 overflow-hidden rounded-[18px] border border-white/55 bg-white/18 shadow-[0_18px_40px_-18px_rgba(15,10,40,0.45)] backdrop-blur-xl sm:inset-x-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CommerceFilm({ playing }: { playing: boolean }) {
  const items = [
    { name: "Studio Can", price: "$25", type: "12 oz" },
    { name: "Citrus Blend", price: "$30", type: "16 oz" },
    { name: "Night Roast", price: "$35", type: "12 oz" },
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
    <StageGlass>
      <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(244,245,255,0.72))] p-2.5">
        <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-extrabold tracking-[0.16em] text-[#673de6] uppercase">
          <ShoppingBag className="size-3" />
          Store checkout
        </p>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
          {items.map((item, index) => {
            const selected = index === picked;
            return (
              <motion.div
                key={item.name}
                className={cn(
                  "flex items-center gap-2 rounded-[14px] bg-white/92 px-2 py-1.5 ring-1",
                  selected ? "ring-[#673de6]/50" : "ring-white",
                )}
                animate={
                  playing
                    ? { scale: selected ? 1.03 : 1, x: selected ? [4, 0] : 0 }
                    : { scale: 1, x: 0 }
                }
                transition={{ duration: 0.4 }}
              >
                <span
                  className={cn(
                    "size-9 shrink-0 rounded-xl",
                    index === 0 &&
                      "bg-[linear-gradient(160deg,#f4f5ff,#c4b5fd)]",
                    index === 1 &&
                      "bg-[linear-gradient(160deg,#fff7ed,#fdba74)]",
                    index === 2 &&
                      "bg-[linear-gradient(160deg,#1e1b4b,#673de6)]",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-extrabold text-[#0c1a36]">
                    {item.name}
                  </span>
                  <span className="mt-0.5 inline-flex rounded-full bg-emerald-50 px-1.5 text-[8px] font-bold text-emerald-600">
                    In stock
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[12px] font-extrabold text-[#673de6]">
                    {item.price}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold text-white",
                      selected ? "bg-emerald-500" : "bg-[#673de6]",
                    )}
                  >
                    {selected ? (
                      <>
                        <Check className="size-2.5" />
                        Booked
                      </>
                    ) : (
                      "Add to cart"
                    )}
                  </span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StageGlass>
  );
}

function MailFilm({ playing }: { playing: boolean }) {
  const mails = [
    { from: "Sara · Pixel", subject: "Brand files delivered", unread: true },
    { from: "Lucas · Northline", subject: "Phase 2 quote", unread: false },
    { from: "you@yourbrand.com", subject: "Welcome to the team", unread: true },
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

  return (
    <StageGlass>
      <div className="flex h-full bg-white/90">
        <div className="hidden w-[4.6rem] shrink-0 flex-col gap-1 border-r border-slate-100 bg-[#f7f5ff] p-2 sm:flex">
          {["Inbox", "Sent", "Star"].map((label, index) => (
            <span
              key={label}
              className={cn(
                "rounded-lg px-1.5 py-1 text-[9px] font-bold",
                index === 0
                  ? "bg-white text-[#673de6] shadow-sm"
                  : "text-slate-400",
              )}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="border-b border-slate-100 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-slate-400 uppercase">
            Inbox · you@yourbrand.com
          </p>
          <div className="space-y-1 p-2">
            {mails.map((mail, index) => (
              <motion.div
                key={mail.subject}
                className={cn(
                  "rounded-xl px-2.5 py-1.5",
                  index === active ? "bg-[#f4f5ff]" : "bg-transparent",
                )}
                animate={playing && index === active ? { x: [8, 0] } : { x: 0 }}
                transition={{ duration: 0.45 }}
              >
                <p className="flex items-center justify-between gap-2 text-[10px] font-bold text-[#2f1c6a]">
                  {mail.from}
                  {mail.unread ? (
                    <span className="size-1.5 rounded-full bg-[#673de6]" />
                  ) : null}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {mail.subject}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </StageGlass>
  );
}

function VpsFilm({ playing }: { playing: boolean }) {
  const lines = [
    "root@vps:~# systemctl status nginx",
    "● nginx.service — active (running)",
    "CPU 12%   RAM 1.4 / 4 GB   NVMe 99%",
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
    <StageGlass className="bg-[#0b1020]/80">
      <div className="flex h-full flex-col p-3 font-mono text-[11px] text-emerald-300 sm:text-[12px]">
        <p className="mb-2 flex items-center gap-1.5 font-sans text-[10px] font-extrabold tracking-[0.16em] text-violet-200 uppercase">
          <Server className="size-3" />
          Isolated VPS
        </p>
        {lines.slice(0, count).map((line) => (
          <motion.p
            key={line}
            initial={playing ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="leading-5"
          >
            {line}
          </motion.p>
        ))}
        {playing ? (
          <span className="hb-caret mt-1 inline-block h-3 w-[7px] bg-emerald-300" />
        ) : null}
        <div className="mt-auto grid grid-cols-3 gap-1.5">
          {["CPU", "RAM", "DISK"].map((label, index) => (
            <div
              key={label}
              className="rounded-lg bg-white/8 px-2 py-1.5 ring-1 ring-white/10"
            >
              <p className="text-[8px] tracking-wider text-slate-400">
                {label}
              </p>
              <motion.div
                className="mt-1 h-1 overflow-hidden rounded-full bg-white/10"
                aria-hidden
              >
                <motion.span
                  className="block h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#34d399]"
                  animate={
                    playing
                      ? {
                          width: [`${28 + index * 12}%`, `${62 + index * 10}%`],
                        }
                      : { width: `${50 + index * 8}%` }
                  }
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </StageGlass>
  );
}

function DomainFilm({ playing }: { playing: boolean }) {
  const [ready, setReady] = useState(!playing);

  useEffect(() => {
    if (!playing) {
      setReady(true);
      return;
    }
    const timer = window.setInterval(() => setReady((value) => !value), 2200);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <StageGlass>
      <div className="flex h-full flex-col items-center justify-center bg-white/80 px-4 text-center">
        <p className="text-[10px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">
          Domain search
        </p>
        <p className="mt-2 text-[18px] font-extrabold tracking-tight text-[#0c1a36]">
          yourbrand
          <span className="text-[#673de6]">.com</span>
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={ready ? "ok" : "check"}
            initial={playing ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold",
              ready
                ? "bg-emerald-500 text-white"
                : "bg-[#f4f5ff] text-[#673de6]",
            )}
          >
            {ready ? (
              <>
                <Check className="size-3.5" />
                Available
              </>
            ) : (
              "Checking…"
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </StageGlass>
  );
}

function CloudFilm({ playing }: { playing: boolean }) {
  const nodes = [
    { label: "NYC", x: "22%", y: "38%" },
    { label: "FRA", x: "48%", y: "32%" },
    { label: "SIN", x: "74%", y: "58%" },
  ];
  const [hot, setHot] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setHot((value) => (value + 1) % nodes.length),
      1600,
    );
    return () => window.clearInterval(timer);
  }, [playing, nodes.length]);

  return (
    <StageGlass>
      <div className="relative h-full bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.35),rgba(15,10,40,0.55))] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.16em] text-white/80 uppercase">
          <Globe2 className="size-3" />
          12 global regions
        </p>
        {nodes.map((node, index) => (
          <motion.span
            key={node.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: node.x, top: node.y }}
            animate={
              playing
                ? { scale: index === hot ? [1, 1.18, 1] : 1 }
                : { scale: 1 }
            }
            transition={{ duration: 1.2 }}
          >
            <span
              className={cn(
                "size-3 rounded-full ring-4",
                index === hot
                  ? "bg-white ring-[#673de6]/50"
                  : "bg-[#93c5fd] ring-white/20",
              )}
            />
            <span className="mt-1 text-[9px] font-bold text-white">
              {node.label}
            </span>
          </motion.span>
        ))}
        <p className="absolute right-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-[#2f1c6a]">
          12 ms · auto scale
        </p>
      </div>
    </StageGlass>
  );
}

function WordpressFilm({ playing }: { playing: boolean }) {
  const [progress, setProgress] = useState(playing ? 18 : 100);

  useEffect(() => {
    if (!playing) {
      setProgress(100);
      return;
    }
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 100 ? 18 : value + 14));
    }, 500);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <StageGlass>
      <div className="flex h-full bg-white/88">
        <div className="w-12 shrink-0 bg-[#1d2327]" />
        <div className="flex min-w-0 flex-1 flex-col p-3">
          <p className="text-[10px] font-extrabold tracking-[0.14em] text-slate-400 uppercase">
            WordPress · turbo
          </p>
          <p className="mt-1 text-[13px] font-extrabold text-[#0c1a36]">
            Installing WooCommerce
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.span
              className="block h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#673de6]"
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {["Theme", "Cache", "SSL"].map((label, index) => (
              <motion.span
                key={label}
                className="rounded-xl bg-[#f4f5ff] px-2 py-2 text-center text-[10px] font-bold text-[#2f1c6a]"
                animate={
                  playing
                    ? { opacity: progress > 30 + index * 20 ? 1 : 0.35 }
                    : { opacity: 1 }
                }
              >
                {label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </StageGlass>
  );
}

function ResellerFilm({ playing }: { playing: boolean }) {
  const plans = [
    { name: "Starter", price: "$2.99" },
    { name: "Business", price: "$5.99" },
    { name: "Agency", price: "$9.99" },
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
    <StageGlass>
      <div className="flex h-full flex-col bg-white/80 p-3">
        <p className="text-[10px] font-extrabold tracking-[0.16em] text-[#673de6] uppercase">
          Your brand · white label
        </p>
        <div className="mt-2 grid flex-1 grid-cols-3 gap-1.5">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={cn(
                "flex flex-col justify-between rounded-2xl p-2 ring-1",
                index === hot
                  ? "bg-[#673de6] text-white ring-[#673de6]"
                  : "bg-white text-[#2f1c6a] ring-slate-100",
              )}
              animate={playing && index === hot ? { y: [-4, 0] } : { y: 0 }}
            >
              <p className="text-[10px] font-bold">{plan.name}</p>
              <p className="text-[13px] font-extrabold">{plan.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </StageGlass>
  );
}

function WebFilm({ playing }: { playing: boolean }) {
  return (
    <StageGlass>
      <div className="flex h-full flex-col bg-white/85 p-3">
        <div className="h-2 w-24 rounded-full bg-slate-200" />
        <motion.div
          className="mt-2 h-[38%] rounded-xl bg-gradient-to-br from-[#2563eb] to-[#673de6]"
          animate={playing ? { opacity: [0.75, 1, 0.75] } : { opacity: 1 }}
          transition={{ duration: 3.2, repeat: Infinity }}
        />
        <div className="mt-2 grid flex-1 grid-cols-3 gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="rounded-lg bg-[#f4f5ff] ring-1 ring-white"
              animate={
                playing
                  ? { y: [6, 0], opacity: [0.4, 1] }
                  : { y: 0, opacity: 1 }
              }
              transition={{
                duration: 1.6,
                delay: index * 0.18,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
          ))}
        </div>
      </div>
    </StageGlass>
  );
}
