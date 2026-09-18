"use client";

import Image from "next/image";

const WORKSPACE_SRC = "/images/home/beyond-ai/workspace.jpg";

export function BeyondAiSiteStack() {
  return (
    <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
      <div className="relative aspect-[4/3] overflow-hidden sm:rounded-[28px] lg:aspect-auto lg:min-h-[540px] lg:rounded-[32px]">
        <Image
          src={WORKSPACE_SRC}
          alt="Building a Beyond AI website on a laptop at a home desk"
          fill
          sizes="(max-width: 1024px) 100vw, 52vw"
          unoptimized
          className="object-cover object-[62%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-[#673de6] via-[#673de6]/35 to-transparent"
        />
      </div>
    </div>
  );
}
