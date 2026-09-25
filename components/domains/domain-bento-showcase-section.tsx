import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  DomainShowcaseMedia,
  type ShowcaseLayout,
} from "@/components/domains/domain-showcase-media";
import type { DomainShowcaseCard } from "@/lib/domains/content";
import { cn } from "@/lib/utils";

export function DomainBentoShowcaseSection({
  eyebrow,
  heading,
  description,
  cards,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  cards: DomainShowcaseCard[];
}) {
  const visible = cards.filter((c) => c.visible !== false);
  if (visible.length === 0) return null;

  const byLayout = (layout: ShowcaseLayout) =>
    visible.find((c) => c.layout === layout);

  const registrar = byLayout("registrar");
  const privacy = byLayout("privacy");
  const support = byLayout("support");
  const setup = byLayout("setup");

  return (
    <section className="bg-[#faf9ff] py-16 sm:py-20">
      <div className="hb-shell max-w-[1280px]">
        <div className="mx-auto max-w-3xl px-2 text-center sm:px-0">
          <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
            {eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.65rem,3.2vw,2.45rem)] leading-[1.1] font-extrabold tracking-[-0.04em] text-[#0f172a]">
            {heading}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
            {description}
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {registrar ? (
            <BentoCard
              card={registrar}
              className="lg:col-span-5 lg:row-span-2"
              visualClassName="min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]"
            />
          ) : null}
          <div className="grid gap-5 lg:col-span-7 lg:grid-cols-7 lg:gap-6">
            {privacy ? (
              <BentoCard
                card={privacy}
                className="lg:col-span-7"
                visualClassName="min-h-[220px] sm:min-h-[260px]"
                imageHeavy
              />
            ) : null}
            {support ? (
              <BentoCard
                card={support}
                className="lg:col-span-4"
                visualClassName="min-h-[220px] sm:min-h-[260px]"
              />
            ) : null}
            {setup ? (
              <BentoCard
                card={setup}
                className="lg:col-span-3"
                visualClassName="min-h-[220px] sm:min-h-[260px]"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  card,
  className,
  visualClassName,
  imageHeavy = false,
}: {
  card: DomainShowcaseCard;
  className?: string;
  visualClassName?: string;
  imageHeavy?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_28px_70px_-36px_rgba(47,28,106,0.4)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          imageHeavy ? "min-h-[220px] flex-[1.2]" : "flex-1",
        )}
      >
        <DomainShowcaseMedia
          layout={card.layout}
          image={card.image}
          video={card.video}
          badge={card.badge}
          className={cn("min-h-[180px]", visualClassName)}
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-[17px] font-extrabold tracking-tight text-[#0f172a] sm:text-[18px]">
          {card.title}
        </h3>
        <p className="mt-2 flex-1 text-[14px] leading-relaxed text-slate-600">
          {card.description}
        </p>
        {card.linkLabel ? (
          <Link
            href={card.linkHref || "#"}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#2f1c6a] hover:text-[#673de6]"
          >
            {card.linkLabel}
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
