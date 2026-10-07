import { BlogSearch } from "@/components/blog/blog-search";

export function BlogHero({ initialQuery = "" }: { initialQuery?: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/30 px-6 py-10 sm:px-10 sm:py-12">
      <div className="relative max-w-3xl">
        <p className="text-xs font-bold tracking-[0.22em] text-[#673de6] uppercase">
          HostingBeyond editorial
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1a1035] sm:text-4xl lg:text-5xl">
          HostingBeyond Blog
        </h1>
        <p className="mt-3 text-lg font-semibold text-[#5b21b6]">
          Build smarter. Host better. Grow online.
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Practical insights on hosting, domains, WordPress, security,
          performance, and growing your online presence.
        </p>
        <div className="mt-8 max-w-xl">
          <BlogSearch initialQuery={initialQuery} />
        </div>
      </div>
    </section>
  );
}
