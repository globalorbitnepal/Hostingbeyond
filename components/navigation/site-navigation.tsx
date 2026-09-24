"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const PREFETCH_PATHS: string[] = [
  routes.home,
  routes.pricing,
  routes.beyondAi,
  routes.businessEmail,
  routes.domainSearch,
  routes.login,
  routes.signup,
];

function isInternalNavHref(href: string, pathname: string): boolean {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === pathname && !url.search) return false;
    return true;
  } catch {
    return false;
  }
}

function NavigationProgressBar() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "active" | "done">("idle");
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPhase("done");
    if (completeTimer.current) clearTimeout(completeTimer.current);
    completeTimer.current = setTimeout(() => setPhase("idle"), 280);
    return () => {
      if (completeTimer.current) clearTimeout(completeTimer.current);
    };
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || !isInternalNavHref(href, pathname)) return;
      setPhase("active");
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={cn(
        "hb-nav-progress pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[2px] opacity-0 transition-opacity duration-200",
        phase !== "idle" && "opacity-100",
      )}
    >
      <div
        className={cn(
          "h-full origin-left bg-gradient-to-r from-[#673de6] via-[#7c3aed] to-[#2563eb]",
          phase === "active" && "hb-nav-progress--active",
          phase === "done" && "hb-nav-progress--done",
        )}
      />
    </div>
  );
}

function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function IdleRoutePrefetch() {
  const router = useRouter();
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;

    const run = () => {
      for (const path of PREFETCH_PATHS) {
        try {
          router.prefetch(path);
        } catch {
          /* ignore */
        }
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 1200);
    return () => window.clearTimeout(t);
  }, [router]);

  return null;
}

/** Global navigation polish: progress, scroll reset, idle prefetch. No visual layout change. */
export function SiteNavigation() {
  return (
    <>
      <NavigationProgressBar />
      <ScrollToTopOnNavigate />
      <IdleRoutePrefetch />
    </>
  );
}
