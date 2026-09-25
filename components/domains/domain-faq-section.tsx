import { DomainFaqList } from "@/components/domains/domain-faq";

export function DomainFaqSection({
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
    <section id="faq" className="hb-home-section hb-band-cream">
      <div className="hb-shell relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">
            {eyebrow}
          </p>
          <h2 className="font-heading mt-3 text-[clamp(1.45rem,2.8vw,2.1rem)] leading-[1.12] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
            {heading}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            {description}
          </p>
        </div>
        <div className="mt-8">
          <DomainFaqList items={items} />
        </div>
      </div>
    </section>
  );
}
