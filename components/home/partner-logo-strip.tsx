"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import type { CmsTechPartner } from "@/lib/orbit/defaults";
import { defaultTechnologyPartners } from "@/lib/orbit/defaults";

/** Premium trust strip — real brand colors, left auto-slide */
const STRIP_IDS = [
  "wordpress",
  "cpanel",
  "plesk",
  "intel",
  "amd",
  "nvme",
  "linux",
  "python",
  "php",
  "mysql",
  "docker",
] as const;

type StripId = (typeof STRIP_IDS)[number];

const LOGO_SRC: Record<StripId, string> = {
  wordpress: "/images/partners/wordpress.svg",
  cpanel: "/images/partners/cpanel.svg",
  plesk: "/images/partners/plesk.svg",
  intel: "/images/partners/intel.svg",
  amd: "/images/partners/amd.svg",
  nvme: "/images/partners/nvme.svg",
  linux: "/images/partners/linux.svg",
  python: "/images/partners/python.svg",
  php: "/images/partners/php.svg",
  mysql: "/images/partners/mysql.svg",
  docker: "/images/partners/docker.svg",
};

/** Intrinsic widths — all render at same visual height as WordPress */
const LOGO_SIZE: Record<StripId, { w: number; h: number }> = {
  wordpress: { w: 185, h: 40 },
  cpanel: { w: 180, h: 44 },
  plesk: { w: 180, h: 44 },
  intel: { w: 180, h: 44 },
  amd: { w: 180, h: 44 },
  nvme: { w: 180, h: 40 },
  linux: { w: 145, h: 40 },
  python: { w: 150, h: 40 },
  php: { w: 180, h: 44 },
  mysql: { w: 180, h: 44 },
  docker: { w: 150, h: 40 },
};

function PartnerRow({
  items,
  keyPrefix,
}: {
  items: Array<{
    id: StripId;
    label: string;
    imageUrl: string;
  }>;
  keyPrefix: string;
}) {
  return (
    <ul
      className="flex shrink-0 items-center gap-0"
      aria-hidden={keyPrefix !== "a"}
    >
      {items.map((partner, index) => {
        const size = LOGO_SIZE[partner.id];
        return (
          <li
            key={`${keyPrefix}-${partner.id}`}
            className="flex shrink-0 items-center"
          >
            {index > 0 ? (
              <span
                aria-hidden
                className="mx-5 h-5 w-px shrink-0 bg-[#7eb6e8]/55 sm:mx-7"
              />
            ) : (
              <span aria-hidden className="w-2 shrink-0 sm:w-3" />
            )}
            {/* Fixed slot height = WordPress visual size for every logo */}
            <span
              className="inline-flex h-12 w-[min(190px,44vw)] items-center justify-center px-1 sm:h-[50px] sm:w-[200px]"
              title={partner.label}
            >
              <Image
                src={`${partner.imageUrl}?v=size6`}
                alt={keyPrefix === "a" ? partner.label : ""}
                width={size.w}
                height={size.h}
                unoptimized
                className="h-[42px] max-h-[42px] w-auto max-w-[180px] object-contain sm:h-[46px] sm:max-h-[46px]"
              />
            </span>
            {index === items.length - 1 ? (
              <span
                aria-hidden
                className="mx-5 h-5 w-px shrink-0 bg-[#7eb6e8]/55 sm:mx-7"
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Premium cream-blue glass partner strip — equal-size logos, continuous left slide.
 */
export function PartnerLogoStrip({
  className,
  partners,
}: {
  className?: string;
  partners?: CmsTechPartner[];
}) {
  const defaults = defaultTechnologyPartners();
  const source = partners?.length ? partners : defaults;
  const byId = new Map(
    source
      .filter((p) => p.visible !== false)
      .map((p) => [p.id.toLowerCase(), p]),
  );

  const items = STRIP_IDS.map((id) => {
    const found = byId.get(id);
    const fallback = defaults.find((d) => d.id === id);
    return {
      id,
      label: found?.label || fallback?.label || id,
      imageUrl: found?.imageUrl?.trim() || LOGO_SRC[id],
    };
  });

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      role="region"
      aria-label="Technology partners"
    >
      <div className="hb-partner-marquee flex w-max items-center">
        <PartnerRow items={items} keyPrefix="a" />
        <PartnerRow items={items} keyPrefix="b" />
      </div>
    </div>
  );
}
