"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { CmsSolutionProduct } from "@/lib/orbit/defaults";
import { SolutionCard, solutionCardWidthClass } from "./solution-card";

type Props = {
  products: CmsSolutionProduct[];
};

export function SolutionCarousel({ products }: Props) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const interacting = useRef(false);

  const count = products.length;

  const scrollToIndex = useCallback(
    (next: number, behavior: ScrollBehavior = "smooth") => {
      const node = scrollerRef.current;
      if (!node || count === 0) return;
      const clamped = ((next % count) + count) % count;
      const card = node.children[clamped] as HTMLElement | undefined;
      if (!card) return;
      node.scrollTo({
        left: card.offsetLeft - 8,
        behavior: reduceMotion ? "auto" : behavior,
      });
      setIndex(clamped);
    },
    [count, reduceMotion],
  );

  const syncIndex = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const children = Array.from(node.children) as HTMLElement[];
    if (!children.length) return;
    const left = node.scrollLeft;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    children.forEach((child, childIndex) => {
      const delta = Math.abs(child.offsetLeft - left);
      if (delta < distance) {
        distance = delta;
        closest = childIndex;
      }
    });
    setIndex(closest);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const onScroll = () => syncIndex();
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [syncIndex]);

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const timer = window.setInterval(() => {
      if (interacting.current || document.hidden) return;
      scrollToIndex(index + 1);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [count, index, paused, reduceMotion, scrollToIndex]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      interacting.current = true;
      scrollToIndex(index + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      interacting.current = true;
      scrollToIndex(index - 1);
    }
  }

  if (count === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        interacting.current = false;
      }}
      onPointerDown={() => {
        interacting.current = true;
        setPaused(true);
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span id={labelId} className="sr-only">
        HostingBeyond solutions
      </span>
      <div
        ref={scrollerRef}
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto px-[var(--hb-shell-pad)] pb-3 outline-none [-ms-overflow-style:none] focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/30 lg:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, productIndex) => (
          <div key={product.id} className={solutionCardWidthClass()}>
            <SolutionCard
              product={product}
              paused={paused}
              priority={productIndex === 0}
            />
          </div>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous solution"
          onClick={() => {
            interacting.current = true;
            scrollToIndex(index - 1);
          }}
          className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label="Solutions"
        >
          {products.map((product, productIndex) => (
            <button
              key={product.id}
              type="button"
              role="tab"
              aria-label={`Go to ${product.name}`}
              aria-selected={productIndex === index}
              onClick={() => {
                interacting.current = true;
                scrollToIndex(productIndex);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                productIndex === index
                  ? "w-6 bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)]"
                  : "w-2 bg-slate-300 hover:bg-slate-400",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next solution"
          onClick={() => {
            interacting.current = true;
            scrollToIndex(index + 1);
          }}
          className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
