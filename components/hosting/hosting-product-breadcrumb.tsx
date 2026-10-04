import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { routes } from "@/config/routes";

export function HostingProductBreadcrumb({
  productName,
}: {
  productName: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="hb-shell py-4 text-[13px] text-slate-500"
    >
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href={routes.home} className="hover:text-[#673de6]">
            Home
          </Link>
        </li>
        <ChevronRight className="size-3.5 opacity-50" aria-hidden />
        <li>
          <Link href={routes.hosting} className="hover:text-[#673de6]">
            Hosting
          </Link>
        </li>
        <ChevronRight className="size-3.5 opacity-50" aria-hidden />
        <li className="font-semibold text-[#2f1c6a]">{productName}</li>
      </ol>
    </nav>
  );
}
