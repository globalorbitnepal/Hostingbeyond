"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Cart" },
  { id: 2, label: "Add-ons" },
  { id: 3, label: "Account" },
  { id: 4, label: "Payment" },
] as const;

export function CheckoutStepNav({
  current,
  className,
  steps = STEPS,
}: {
  current: number;
  className?: string;
  steps?: readonly { id: number; label: string }[];
}) {
  return (
    <nav aria-label="Checkout progress" className={cn("w-full", className)}>
      <ol className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:justify-center sm:gap-0">
        {steps.map((step, index) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 items-center sm:max-w-[9rem] sm:flex-none"
            >
              <div className="flex w-full flex-col items-center gap-1.5 px-1">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-[12px] font-extrabold transition-all",
                    done &&
                      "bg-gradient-to-br from-[var(--hb-co-primary)] to-[var(--hb-co-blue)] text-white shadow-[0_6px_14px_-6px_rgb(103_61_230/60%)]",
                    active &&
                      "bg-gradient-to-br from-[var(--hb-co-royal)] via-[var(--hb-co-primary)] to-[var(--hb-co-blue)] text-white shadow-[0_8px_18px_-8px_rgb(43_10_102/60%)] ring-4 ring-[var(--hb-co-lavender)]/40",
                    !done &&
                      !active &&
                      "border border-[var(--hb-co-border)] bg-white text-[var(--hb-co-text-muted)]",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? "✓" : step.id}
                </span>
                <span
                  className={cn(
                    "text-center text-[10px] font-bold tracking-wide uppercase sm:text-[11px]",
                    active
                      ? "text-[var(--hb-co-royal)]"
                      : "text-[var(--hb-co-text-muted)]",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "hidden h-0.5 flex-1 sm:block",
                    done
                      ? "bg-[var(--hb-co-primary)]"
                      : "bg-[var(--hb-co-border)]",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
