"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

const PHOTO = "/images/hosting/web-hosting-hero-office.jpg";

/** Full-bleed lifestyle photograph — no cards, no frame, no UI chrome. */
export function WebHostingHeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <Image
        src={PHOTO}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[78%_42%]"
      />
    </div>
  );
}
