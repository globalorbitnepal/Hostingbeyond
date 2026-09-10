import Link from "next/link";
import Image from "next/image";

import { HostingBeyondLogo } from "@/components/shared/hostingbeyond-logo";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
  /** Kept for Orbit CMS API compatibility */
  src?: string;
  variant?: "image" | "mark";
};

/**
 * Premium HostingBeyond wordmark for light glass header.
 * Uses a clean transparent PNG (HB monogram) — sharp at retina sizes.
 */
export function Logo({
  className,
  href = "/",
  src = "/logo/hostingbeyond-logo-v5.png",
  variant = "image",
}: LogoProps) {
  const content =
    variant === "mark" ? (
      <HostingBeyondLogo
        className={cn("h-[32px] w-auto sm:h-[36px] xl:h-[40px]", className)}
      />
    ) : (
      <Image
        src={src}
        alt="HostingBeyond"
        width={1400}
        height={232}
        priority
        unoptimized
        className={cn(
          "m-0 block h-[30px] w-auto max-w-[min(100%,250px)] bg-transparent object-contain object-left align-middle sm:h-[34px] sm:max-w-[280px] xl:h-[38px] xl:max-w-[310px]",
          className,
        )}
      />
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
