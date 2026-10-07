import Link from "next/link";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export function BlogCta({
  categorySlug,
  compact = false,
  className,
}: {
  categorySlug?: string | null;
  compact?: boolean;
  className?: string;
}) {
  const domain = categorySlug === "domains" || categorySlug === "domain";
  const email = categorySlug === "business-email";
  const hosting = !domain && !email;

  return (
    <div
      className={cn(
        "rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5",
        compact && "p-4",
        className,
      )}
    >
      {hosting ? (
        <>
          <p className="font-bold text-[#1a1035]">
            Need hosting for your website?
          </p>
          <Link
            href={routes.hosting}
            className="mt-3 inline-flex rounded-full bg-[#673de6] px-4 py-2 text-sm font-semibold text-white"
          >
            View hosting plans
          </Link>
        </>
      ) : null}
      {domain ? (
        <>
          <p className="font-bold text-[#1a1035]">Need a domain?</p>
          <Link
            href={routes.domainSearch}
            className="mt-3 inline-flex rounded-full bg-[#673de6] px-4 py-2 text-sm font-semibold text-white"
          >
            Search domains
          </Link>
        </>
      ) : null}
      {email ? (
        <>
          <p className="font-bold text-[#1a1035]">
            Professional email for your business?
          </p>
          <Link
            href={routes.businessEmail}
            className="mt-3 inline-flex rounded-full bg-[#673de6] px-4 py-2 text-sm font-semibold text-white"
          >
            Explore business email
          </Link>
        </>
      ) : null}
    </div>
  );
}
