import Link from "next/link";
import { ArrowRight, Headphones, ListOrdered } from "lucide-react";

import { DomainWhyPrivacyPanel } from "@/components/domains/domain-why-privacy-panel";
import { DomainWhySearchIllustration } from "@/components/domains/domain-why-search-illustration";
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

  const byLayout = (layout: DomainShowcaseCard["layout"]) =>
    visible.find((c) => c.layout === layout);

  const registrar = byLayout("registrar");
  const privacy = byLayout("privacy");
  const support = byLayout("support");
  const setup = byLayout("setup");

  return (
    <section className="overflow-x-hidden bg-[#faf9ff] py-14 sm:py-18 lg:py-20">
      <div className="hb-shell max-w-[1280px]">
        <div className="mx-auto max-w-3xl px-1 text-center sm:px-0">
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

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-4">
            <DomainWhySearchIllustration />
            {registrar ? (
              <article className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(47,28,106,0.25)] sm:p-6">
                <h3 className="text-[17px] font-extrabold tracking-tight text-[#0f172a]">
                  {registrar.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                  {registrar.description}
                </p>
                {registrar.linkLabel ? (
                  <Link
                    href={registrar.linkHref || "#pricing"}
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[#2f1c6a] hover:text-[#673de6]"
                  >
                    {registrar.linkLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                ) : null}
              </article>
            ) : null}
          </div>

          <div className="min-w-0 space-y-5">
            {privacy ? (
              <DomainWhyPrivacyPanel
                title={privacy.title}
                description={privacy.description}
                linkLabel={privacy.linkLabel || "Learn about privacy"}
                linkHref={privacy.linkHref || "#domain-guide"}
              />
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {support ? (
                <CompactCard
                  icon={Headphones}
                  card={support}
                  className="sm:col-span-1"
                />
              ) : null}
              {setup ? (
                <CompactCard
                  icon={ListOrdered}
                  card={setup}
                  className="sm:col-span-1"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompactCard({
  card,
  icon: Icon,
  className,
}: {
  card: DomainShowcaseCard;
  icon: typeof Headphones;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_32px_-24px_rgba(47,28,106,0.3)] transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none sm:p-5",
        className,
      )}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#f3eeff] text-[#673de6]">
        <Icon className="size-5" strokeWidth={1.9} aria-hidden />
      </span>
      <h3 className="mt-3 text-[15px] font-extrabold text-[#0f172a]">
        {card.title}
      </h3>
      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-600">
        {card.description}
      </p>
      {card.linkLabel ? (
        <Link
          href={card.linkHref || "#"}
          className="mt-3 inline-flex items-center gap-1 text-[12px] font-extrabold text-[#673de6] hover:text-[#5b2fd4]"
        >
          {card.linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </article>
  );
}
