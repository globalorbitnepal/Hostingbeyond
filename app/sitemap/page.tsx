import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { breadcrumbJsonLd } from "@/lib/blog/seo";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/config/routes";
import { editorialPageCatalog } from "@/lib/orbit/editorial-page-content";

export const metadata: Metadata = buildMetadata({
  title: "Sitemap — HostingBeyond Pages & Resources",
  description:
    "HTML sitemap for HostingBeyond: web hosting plans, domains, business email, help, legal policies, and company pages on hosting.theglobalorbit.com.",
  path: "/sitemap",
  keywords: ["HostingBeyond sitemap", "site map", "hosting pages"],
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Sitemap", path: "/sitemap" },
];

const PRODUCT_LINKS = [
  { href: routes.hosting, label: "Web hosting" },
  { href: "/web-hosting/wordpress", label: "WordPress hosting" },
  { href: routes.cloud, label: "Cloud hosting" },
  { href: routes.businessEmail, label: "Business email" },
  { href: routes.domainSearch, label: "Domain search" },
  { href: routes.pricing, label: "Pricing" },
  { href: routes.websiteMigration, label: "Website migration" },
] as const;

const COMPANY_LINKS = editorialPageCatalog
  .filter((p) => p.category === "company")
  .map((p) => ({ href: p.path, label: p.label }));

const RESOURCE_LINKS = editorialPageCatalog
  .filter((p) => p.category === "resources")
  .map((p) => ({ href: p.path, label: p.label }));

const LEGAL_LINKS = [
  { href: "/legal", label: "Legal overview" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/refund", label: "Refund Policy" },
] as const;

function LinkSection({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-[1.1rem] font-extrabold text-[#2f1c6a]">
        {title}
      </h2>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[14px] font-medium text-[#673de6] hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HtmlSitemapPage() {
  return (
    <>
      <Script
        id="html-sitemap-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(CRUMBS)),
        }}
      />
      <div className="hb-band-purple py-12 sm:py-14">
        <div className="hb-shell mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-[clamp(1.85rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.04em] text-white">
            Sitemap
          </h1>
          <p className="mt-3 text-[15px] text-white/85">
            Browse main HostingBeyond pages. Search engines also use{" "}
            <Link
              href="/sitemap.xml"
              className="font-semibold text-white underline underline-offset-2"
            >
              sitemap.xml
            </Link>
            .
          </p>
        </div>
      </div>
      <div className="hb-band-cream py-12 sm:py-14">
        <div className="hb-shell mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <LinkSection title="Products" links={PRODUCT_LINKS} />
          <LinkSection title="Company" links={COMPANY_LINKS} />
          <LinkSection title="Resources" links={RESOURCE_LINKS} />
          <LinkSection title="Legal" links={LEGAL_LINKS} />
        </div>
        <p className="hb-shell mx-auto mt-8 max-w-5xl text-center text-[13px] text-slate-500">
          <Link
            href={routes.contact}
            className="text-[#673de6] hover:underline"
          >
            Contact
          </Link>
          {" · "}
          <Link href={routes.about} className="text-[#673de6] hover:underline">
            About
          </Link>
          {" · "}
          <Link href={routes.home} className="text-[#673de6] hover:underline">
            Home
          </Link>
        </p>
      </div>
    </>
  );
}
