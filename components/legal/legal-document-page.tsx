import Link from "next/link";

import type { LegalDocumentContent } from "@/lib/legal/legal-document-types";

export function LegalDocumentPage({
  document,
}: {
  document: LegalDocumentContent;
}) {
  return (
    <article className="hb-band-cream min-h-dvh py-12 sm:py-16">
      <div className="hb-shell mx-auto max-w-3xl">
        <p className="text-[11px] font-bold tracking-[0.22em] text-slate-500 uppercase">
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
