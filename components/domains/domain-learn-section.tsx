import { DomainFaqList } from "@/components/domains/domain-faq";

export function DomainLearnSection({
  eyebrow,
  heading,
  description,
  items,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  items: Array<{ question: string; answer: string }>;
}) {
  if (items.length === 0) return null;

  return (
    <section
      id="domain-guide"
      className="hb-home-section border-t border-slate-200/70 bg-[#f8f7ff]"
    >
      <div className="hb-shell relative z-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
              {eyebrow}
            </p>
            <h2 className="font-heading mt-3 text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
              {heading}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {description}
            </p>
            <ul className="mt-6 space-y-2 text-[13px] font-semibold text-[#4c1d95]">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#673de6]" />
                Check availability in one search
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#673de6]" />
                Renewal price shown before checkout
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#673de6]" />
                Free privacy &amp; DNS on eligible names
              </li>
            </ul>
          </div>

          <div className="rounded-[24px] border border-white bg-white/95 p-1 shadow-[0_20px_50px_-36px_rgba(47,28,106,0.45)] ring-1 ring-slate-100">
            <DomainFaqList items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}
