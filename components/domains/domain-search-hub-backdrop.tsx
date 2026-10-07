import Image from "next/image";

/**
 * Persistent hero backdrop for domain search routes — lives in the shared layout
 * so soft navigation between /domain-name-search and /bulk-domain-search does not
 * remount the full-bleed image and gradient.
 */
export function DomainSearchHubBackdrop({ heroImage }: { heroImage: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_20%] opacity-70 mix-blend-screen sm:object-[62%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,18,84,0.92)_0%,rgba(58,29,150,0.78)_42%,rgba(37,99,235,0.35)_100%)]" />
    </div>
  );
}
