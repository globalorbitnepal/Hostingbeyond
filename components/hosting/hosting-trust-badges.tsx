import { Check } from "lucide-react";

import type { HostingProductBenefit } from "@/lib/hosting/product-types";

export function HostingTrustBadges({
  benefits,
}: {
  benefits: HostingProductBenefit[];
}) {
  if (!benefits.length) return null;
  return (
    <section className="hb-band-cream border-b border-[#ebe6ff] py-6">
      <div className="hb-shell flex flex-wrap justify-center gap-3">
        {benefits.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-2 rounded-full border border-[#e4dcff] bg-white px-4 py-2 text-[13px] font-semibold text-[#2f1c6a] shadow-sm"
          >
            <Check className="size-4 text-[#673de6]" />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
