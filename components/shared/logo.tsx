import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

/** Single canonical header wordmark — never swap after hydration. */
export const CANONICAL_HEADER_LOGO_SRC = "/logo/hostingbeyond-logo-v6.png";

const LOGO_ASPECT = 981 / 182;

type LogoProps = {
  className?: string;
  href?: string;
  /** Ignored for public header stability; always uses canonical PNG unless explicitly overridden for Orbit. */
  src?: string;
  variant?: "image" | "mark";
  /** When true, `src` is respected (Orbit preview, checkout). Default: canonical only. */
  allowCustomSrc?: boolean;
};

/**
 * Premium HostingBeyond wordmark for light glass header.
 * Uses a clean transparent PNG (HB monogram) — sharp at retina sizes.
 */
export function Logo({
  className,
  href = "/",
  src,
  variant = "image",
  allowCustomSrc = false,
}: LogoProps) {
  const resolvedSrc =
    allowCustomSrc && src?.trim() ? src.trim() : CANONICAL_HEADER_LOGO_SRC;

  const content =
    variant === "mark" ? (
      <Image
        src={CANONICAL_HEADER_LOGO_SRC}
        alt="HostingBeyond"
        width={981}
        height={182}
        priority
        unoptimized
        className={cn(
          "m-0 block h-[30px] w-auto max-w-[min(100%,250px)] bg-transparent object-contain object-left align-middle sm:h-[34px] sm:max-w-[280px] xl:h-[38px] xl:max-w-[310px]",
          className,
        )}
      />
    ) : (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-start leading-none",
          className,
        )}
        style={{
          aspectRatio: `${LOGO_ASPECT}`,
          minHeight: "26px",
        }}
      >
        <Image
          src={resolvedSrc}
          alt="HostingBeyond"
          width={981}
          height={182}
          priority
          fetchPriority="high"
          unoptimized
          className="m-0 block h-[26px] w-auto max-w-full bg-transparent object-contain object-left sm:h-[32px] lg:h-[34px] xl:h-[38px]"
        />
      </span>
    );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="relative inline-flex shrink-0 items-center justify-start leading-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--hb-purple)]/60"
      aria-label="HostingBeyond home"
    >
      {content}
    </Link>
  );
}
