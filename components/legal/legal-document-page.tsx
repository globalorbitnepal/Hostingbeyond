import Link from "next/link";
import Script from "next/script";

import { breadcrumbJsonLd } from "@/lib/blog/seo";
import type { LegalDocumentContent } from "@/lib/legal/legal-document-types";
import { LEGAL_NAV } from "@/lib/legal/legal-nav";

export function LegalDocumentPage({
  document,
  path,
}: {
  document: LegalDocumentContent;
  path: string;
}) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Legal", path: "/legal" },
    { name: document.title, path },
  ];

  return (
    <article className="hb-band-cream py-12 sm:py-16">
      <Script
        id={`${path.replaceAll("/", "-")}-breadcrumb-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <div className="hb-shell mx-auto max-w-3xl">
        <nav
          aria-label="Legal documents"
          className="flex flex-wrap gap-x-4 gap-y-2 border-b border-slate-200/80 pb-5"
        >
          {LEGAL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.href === path
                  ? "text-[13px] font-bold text-[#673de6]"
                  : "text-[13px] font-medium text-slate-500 hover:text-[#673de6]"
              }
              aria-current={item.href === path ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase">
          Legal
        </p>
        <h1 className="font-heading mt-3 text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-[#2f1c6a]">
          {document.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          {document.description}
        </p>
        <p className="mt-2 text-[13px] text-slate-500">
          Last updated: {document.lastUpdated}
        </p>

        <div className="mt-10 space-y-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-[1.25rem] font-bold text-[#2f1c6a]">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700">
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-[14px] text-slate-600">
          Questions?{" "}
          <Link
            href="/contact"
            className="font-semibold text-[#673de6] hover:underline"
          >
            Contact HostingBeyond support
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
