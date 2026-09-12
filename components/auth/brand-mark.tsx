import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandMark({
  src = "/logo/hostingbeyond-logo-v5.png",
  className,
}: {
  src?: string;
  className?: string;
}) {
  return (
    <Image
      src={src || "/logo/hostingbeyond-logo-v5.png"}
      alt="HostingBeyond"
      width={1400}
      height={232}
      priority
      unoptimized
      className={cn(
        "m-0 block h-10 w-auto max-w-[min(100%,240px)] bg-transparent object-contain object-left sm:h-11 sm:max-w-[280px]",
        className,
      )}
    />
  );
}
