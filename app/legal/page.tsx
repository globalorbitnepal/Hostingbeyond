import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/metadata";
import { LEGAL_NAV } from "@/lib/legal/legal-nav";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Legal", path: "/legal" },
];

export const metadata: Metadata = buildMetadata({
  title: "Legal — Terms, Privacy, Refunds & Policies",
  description:
    "HostingBeyond legal hub: Terms of Service, Privacy Policy, Refund Policy, and sitemap for hosting.theglobalorbit.com.",
  path: "/legal",
  keywords: [
    "HostingBeyond legal",
    "terms of service",
    "privacy policy",
    "refund policy",
    "hosting terms",
  ],
});

const POLICY_CARDS = [
  {
    href: "/legal/terms",
    title: "Terms of Service",
    body: "Account rules, acceptable use, billing, renewals, and liability when you use HostingBeyond hosting, domains, and email.",
  },
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    body: "What data we collect for accounts, checkout, support, and cookies on the public site and customer panel.",
  },
  {
    href: "/legal/refund",
    title: "Refund Policy",
    body: "Refund windows and eligibility for hosting, domains, SSL, and business email purchased on HostingBeyond.",
  },
] as const;

export default function LegalHubPage() {
  return (
    <>
      <Script
        id="legal-hub-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(CRUMBS)),
        }}
      />
      <div className="hb-band-purple py-14 sm:py-16">
        <div className="hb-shell mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-white/70 uppercase">
            Legal
          </p>
          <h1 className="font-heading mt-3 text-[clamp(2rem,4vw,2.85rem)] font-extrabold tracking-[-0.04em] text-white">
            Policies for HostingBeyond customers
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85 sm:text-[16px]">
            Terms, privacy, and refunds for web hosting, domain registration,
            SSL, and business email on hosting.theglobalorbit.com. These pages
            are the contract references; marketing copy does not override
            checkout terms.
          </p>
        </div>
      </div>

      <div className="hb-band-cream py-12 sm:py-16">
        <div className="hb-shell mx-auto max-w-4xl">
          <nav
            aria-label="Legal documents"
            className="mb-10 flex flex-wrap justify-center gap-x-5 gap-y-2"
          >
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.href === "/legal"
                    ? "text-[13px] font-bold text-[#673de6]"
                    : "text-[13px] font-medium text-slate-600 hover:text-[#673de6]"
                }
                aria-current={item.href === "/legal" ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <ul className="grid gap-5 sm:grid-cols-3">
            {POLICY_CARDS.map((card) => (
              <li
                key={card.href}
                className="flex flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_-28px_rgba(47,28,106,0.35)]"
              >
                <h2 className="font-heading text-[1.15rem] font-extrabold text-[#2f1c6a]">
                  <Link href={card.href} className="hover:text-[#673de6]">
                    {card.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">
                  {card.body}
                </p>
                <Link
                  href={card.href}
                  className="mt-4 text-[13px] font-bold text-[#673de6] hover:underline"
                >
                  Read full policy →
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center text-[14px] text-slate-600">
            Questions about legal terms?{" "}
            <Link
              href="/contact"
              className="font-semibold text-[#673de6] hover:underline"
            >
              Contact HostingBeyond
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
