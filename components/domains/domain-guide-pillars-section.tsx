import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { DomainFrameImage } from "@/components/domains/domain-frame-image";
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
    <section id="domain-guide" className="bg-[#0a0f1f] py-16 sm:py-20">
      <div className="hb-shell">
        <h2 className="font-heading mx-auto max-w-3xl px-2 text-center text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-white">
          {heading}
        </h2>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {visible.map((pillar) => {
            const bg =
              pillar.image?.trim() ||
              `/images/domains/frames/pillar-${pillar.pillar}.svg`;
            const hasCustomBg = Boolean(pillar.image?.trim());

            return (
              <li
                key={pillar.id}
                className="relative flex min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-white/10 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.8)]"
              >
                <div className="absolute inset-0">
                  {hasCustomBg ? (
                    <DomainFrameImage
                      src={bg}
                      alt=""
                      overlay="dark"
                      className="object-cover"
                    />
                  ) : (
                    <>
                      <DomainFrameImage
                        src={bg}
                        alt=""
                        overlay="none"
                        className="object-cover"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0f1f] via-[#0a0f1f]/75 to-[#0a0f1f]/35"
                      />
                      <div className="absolute inset-x-0 top-0 h-[42%] opacity-90">
                        <DomainShowcaseMedia
                          layout={pillar.pillar}
                          image=""
                          video={pillar.video}
                          className="min-h-full"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="relative z-10 mt-auto flex flex-1 flex-col justify-end p-6 pt-32">
                  <h3 className="text-[17px] font-extrabold tracking-tight text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">
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
            );
          })}
        </ul>
      </div>
    </section>
  );
}
