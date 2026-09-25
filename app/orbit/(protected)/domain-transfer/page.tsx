import Link from "next/link";

import { routes } from "@/config/routes";

export default function OrbitDomainTransferRedirect() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold text-slate-900">Domain transfer copy</h1>
      <p className="text-sm leading-relaxed text-slate-600">
        Transfer page text, SEO, stats and FAQs now live in{" "}
        <strong>Domain Pages → Domain transfer</strong>, the same editor as
        domain search and bulk search.
      </p>
      <p className="text-sm text-slate-600">
        Public page:{" "}
        <a href={routes.domainTransfer} className="text-violet-600 underline">
          {routes.domainTransfer}
        </a>
      </p>
      <Link
        href="/orbit/domains"
        className="inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Open Domain Pages
      </Link>
    </div>
  );
}
