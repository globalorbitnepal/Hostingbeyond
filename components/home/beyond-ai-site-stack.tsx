"use client";

import Image from "next/image";

const WORKSPACE_SRC = "/images/home/beyond-ai/workspace.jpg";

export function BeyondAiSiteStack() {
  return (
    <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_28px_70px_-28px_rgba(15,10,40,0.55)] sm:rounded-[32px] lg:aspect-auto lg:min-h-[520px] lg:rounded-[36px]">
        <Image
          src={WORKSPACE_SRC}
          alt="Building a Beyond AI website on a laptop at a home desk"
          fill
          sizes="(max-width: 1024px) 100vw, 52vw"
          unoptimized
          className="object-cover object-[58%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#673de6] via-[#673de6]/45 to-transparent lg:w-[22%]"
        />
      </div>
    </div>
  );
}
