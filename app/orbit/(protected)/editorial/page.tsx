import Link from "next/link";

import { EDITORIAL_PAGES } from "@/lib/orbit/editorial-page-content";

const EXISTING_FOOTER_EDITORS = [
  { label: "Web Hosting", path: "/web-hosting", editor: "/orbit/hosting" },
  {
    label: "WordPress Hosting",
    path: "/web-hosting/wordpress",
    editor: "/orbit/hosting",
  },
  {
    label: "Business Email",
    path: "/business-email",
    editor: "/orbit/business-email",
  },
  {
    label: "Domain Names",
    path: "/domain-name-search",
    editor: "/orbit/domains",
  },
  { label: "SSL Certificates", path: "/web-hosting/ssl", editor: "/orbit/ssl" },
  { label: "Add-ons", path: "/pricing", editor: "/orbit/hosting-addons" },
  { label: "Website Builder", path: "/beyond-ai", editor: "/orbit/beyond-ai" },
  { label: "About Us", path: "/about", editor: "/orbit/about" },
  { label: "Our Blog", path: "/resources/blog", editor: "/orbit/blog" },
  { label: "Contact Us", path: "/contact", editor: "/orbit/contact" },
  {
    label: "Submit a Ticket / Live Chat / Report Abuse",
    path: "/contact",
    editor: "/orbit/contact",
  },
  {
    label: "Migration Support",
    path: "/website-migration",
    editor: "/orbit/website-migration",
  },
  {
    label: "SEO Tips",
    path: "/resources/tips",
    editor: "/orbit/blog/tips-hub",
  },
  {
    label: "Developer Docs",
    path: "/resources/docs",
    editor: "/orbit/blog/docs-hub",
  },
  {
    label: "Business Growth",
    path: "/resources/growth",
    editor: "/orbit/blog/growth-hub",
  },
  {
    label: "Product Updates",
    path: "/resources/updates",
    editor: "/orbit/blog/updates-hub",
  },
  {
    label: "Case Studies",
    path: "/resources/case-studies",
    editor: "/orbit/blog/case-studies-hub",
  },
];

export default function OrbitEditorialIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Footer pages</h1>
        <p className="mt-1 text-sm text-slate-500">
          New company and resource pages that did not have a live URL. Product
          and hub pages already have their own Orbit editors — those are listed
          below, not duplicated.
        </p>
      </div>
      <section>
        <h2 className="text-sm font-bold tracking-wide text-slate-400 uppercase">
          Editable here
        </h2>
        <ul className="mt-2 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {EDITORIAL_PAGES.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/orbit/editorial/${page.slug}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50"
              >
                <span className="font-semibold">{page.label}</span>
                <span className="text-slate-400">{page.path}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-bold tracking-wide text-slate-400 uppercase">
          Already have full editors
        </h2>
        <ul className="mt-2 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {EXISTING_FOOTER_EDITORS.map((page) => (
            <li key={`${page.editor}-${page.path}`}>
              <Link
                href={page.editor}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50"
              >
                <span className="font-semibold">{page.label}</span>
                <span className="text-slate-400">{page.path}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
