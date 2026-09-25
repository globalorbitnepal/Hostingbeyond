import type { DomainIconCard } from "@/lib/domains/content";
import {
  BadgeCheck,
  Clock,
  Globe2,
  Headphones,
  Layers,
  Mail,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const ICONS: Record<string, typeof ShieldCheck> = {
  shield: ShieldCheck,
  server: ServerCog,
  clock: Clock,
  headphones: Headphones,
  mail: Mail,
  badge: BadgeCheck,
  layers: Layers,
  wallet: Wallet,
  refresh: RefreshCw,
  globe: Globe2,
};

export function DomainWhyBuySection({
  eyebrow,
  heading,
  description,
  items,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  items: DomainIconCard[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-slate-200/80 bg-white py-12 sm:py-14">
      <div className="hb-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
            {eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
            {heading}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
            {description}
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? ShieldCheck;
            return (
              <li
                key={item.id}
                className="rounded-[20px] border border-slate-200/90 bg-[#faf9ff] p-5 shadow-[0_14px_40px_-32px_rgba(47,28,106,0.35)] transition hover:border-[#d4c4ff] hover:bg-white"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white text-[#673de6] shadow-sm ring-1 ring-slate-100">
                  <Icon className="size-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 text-[15px] font-extrabold tracking-tight text-[#2f1c6a]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
