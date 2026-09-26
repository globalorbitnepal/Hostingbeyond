"use client";

import Image from "next/image";
import Link from "next/link";

import { routes } from "@/config/routes";
import {
  defaultBeyondAiSection,
  type CmsBeyondAiContent,
} from "@/lib/orbit/defaults";

export function BeyondAiSection({ content }: { content?: CmsBeyondAiContent }) {
  const data = content ?? defaultBeyondAiSection();
  const image =
    data.workspaceImageUrl?.trim() ||
    "/images/home/beyond-ai/dream-section.png";

  return (
    <section className="hb-home-section relative overflow-hidden bg-[#4c1d95]">
      <div className="relative">
        <Image
          src={image}
          alt={
            data.workspaceImageAlt || "Build your dream website with Beyond AI"
          }
          width={1920}
          height={1080}
          priority
          className="h-auto w-full object-cover"
          sizes="100vw"
        />
        <Link
          href={data.primaryCtaHref || routes.beyondAi}
          aria-label={data.primaryCtaLabel || "Get Started"}
          className="absolute bottom-[7.2%] left-[3.6%] z-10 h-[8.2%] w-[18%] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        />
      </div>
    </section>
  );
}
