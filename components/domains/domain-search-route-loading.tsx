/**
 * Route-level loading UI for domain search hub — preserves hero/search shell dimensions.
 * The shared layout (header, backdrop, footer) stays mounted.
 */
export function DomainSearchRouteLoading() {
  return (
    <section
      className="relative z-10 pt-6 pb-10 sm:pt-10 sm:pb-14 lg:pb-16"
      aria-busy="true"
      aria-label="Loading domain search"
    >
      <div className="hb-shell mx-auto w-full max-w-[100rem]">
        <div className="mx-auto mb-6 h-4 w-48 max-w-full rounded bg-white/15 sm:mb-8" />
        <div className="mx-auto w-full max-w-[min(100%,52rem)] text-center sm:max-w-3xl lg:max-w-4xl 2xl:max-w-5xl">
          <div className="mx-auto h-8 w-40 rounded-full bg-white/12" />
          <div className="mx-auto mt-4 h-12 w-full max-w-lg rounded-lg bg-white/10" />
          <div className="mx-auto mt-3 h-10 w-full max-w-md rounded-lg bg-white/8" />
          <div className="mx-auto mt-8 h-[220px] w-full max-w-[min(100%,78rem)] rounded-[28px] border border-white/25 bg-white/95 shadow-lg" />
        </div>
      </div>
    </section>
  );
}
