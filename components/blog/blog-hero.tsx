import { BlogSearch } from "@/components/blog/blog-search";
import { BookOpen, ShieldCheck, Zap } from "lucide-react";

export function BlogHero({
  initialQuery = "",
  total,
}: {
  initialQuery?: string;
  total?: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_24px_70px_-32px_rgba(79,70,229,0.35)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_-10%,rgba(124,58,237,0.18),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgba(37,99,235,0.14),transparent_50%)]"
      />
      <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
        <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-[#673de6] uppercase">
          <BookOpen className="size-3.5" />
          HostingBeyond editorial
        </p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.08] font-extrabold tracking-tight text-[#1a1035]">
          Hosting, domains and websites — explained properly
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          Deep, tested guides on hosting performance, domain management,
          WordPress, email deliverability and website security. No filler, no
          recycled listicles.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="size-3.5" /> Reviewed by our engineers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
            <Zap className="size-3.5" /> Measured, not guessed
          </span>
          {typeof total === "number" && total > 0 ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {total} article{total === 1 ? "" : "s"} published
            </span>
          ) : null}
        </div>

        <div className="mt-8 max-w-xl">
          <BlogSearch initialQuery={initialQuery} />
        </div>
      </div>
    </section>
  );
}
