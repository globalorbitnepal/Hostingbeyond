import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { DomainShowcaseMedia } from "@/components/domains/domain-showcase-media";
import type { DomainGuidePillar } from "@/lib/domains/content";

export function DomainGuidePillarsSection({
  heading,
  pillars,
}: {
  heading: string;
  pillars: DomainGuidePillar[];
}) {
  const visible = pillars.filter((p) => p.visible !== false);
  if (visible.length === 0) return null;

  return (
    <section id="domain-guide" className="bg-[#0a0f1f] py-14 sm:py-16">
      <div className="hb-shell">
        <h2 className="font-heading mx-auto max-w-3xl text-center text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-white">
          {heading}
        </h2>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {visible.map((pillar) => (
            <li
              key={pillar.id}
              className="flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#12182b]"
            >
              <div className="relative min-h-[180px] border-b border-white/10">
                <DomainShowcaseMedia
                  layout={pillar.pillar}
                  image={pillar.image}
                  video={pillar.video}
                  className="min-h-[180px]"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[16px] font-extrabold text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-white/75">
                  {pillar.description}
                </p>
                {pillar.linkLabel ? (
                  <Link
                    href={pillar.linkHref || "#"}
                    className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-[#a5b4fc] hover:text-white"
                  >
                    {pillar.linkLabel}
                    <ArrowUpRight className="size-4" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
