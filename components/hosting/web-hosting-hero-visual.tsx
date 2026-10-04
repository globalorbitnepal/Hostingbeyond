"use client";

import Image from "next/image";

/** Approved reference art — photo + glass UI baked in; only left-feather into page hero. */
const HERO_ART = "/images/hosting/web-hosting-hero-reference.webp";

export function WebHostingHeroVisual({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="absolute inset-0">
        <Image
          src={HERO_ART}
          alt=""
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 62vw"
          className="object-cover object-[70%_50%] sm:object-[72%_48%] lg:object-[76%_46%]"
        />

        {/* Merge into page purple — no extra frame/box */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              "linear-gradient(92deg, #2f1c6a 0%, #2f1c6a 4%, rgba(47,28,106,0.96) 12%, rgba(47,28,106,0.72) 24%, rgba(47,28,106,0.28) 38%, transparent 48%)",
              "linear-gradient(180deg, rgba(47,28,106,0.45) 0%, transparent 14%, transparent 88%, rgba(53,32,111,0.35) 100%)",
            ].join(", "),
          }}
        />
      </div>
    </div>
  );
}
