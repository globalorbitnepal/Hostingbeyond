import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function PanelPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <p className="hb-eyebrow">{eyebrow}</p> : null}
        <h1 className="hb-h1 mt-1">{title}</h1>
        {description ? (
          <p className="hb-muted mt-1 max-w-2xl text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function PanelCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("hb-panel-card p-5", className)}>{children}</section>
  );
}

export function PanelCardTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h2 className="hb-h2">{title}</h2>
        {description ? (
          <p className="hb-muted mt-0.5 text-xs">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PanelStat({
  label,
  value,
  hint,
  href,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
  icon: LucideIcon;
  tone?: "default" | "warn" | "ok";
}) {
  return (
    <Link
      href={href}
      className="hb-panel-stat group block p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="hb-muted text-[11px] font-bold tracking-wide uppercase">
          {label}
        </p>
        <Icon
          className={cn(
            "size-4",
            tone === "warn"
              ? "text-[var(--hb-p-warn)]"
              : tone === "ok"
                ? "text-[var(--hb-p-ok)]"
                : "text-[var(--hb-p-primary)]",
          )}
          aria-hidden
        />
      </div>
      <p className="hb-text mt-2 text-2xl font-extrabold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-0.5 text-xs",
            tone === "warn" ? "hb-text font-semibold" : "hb-muted",
          )}
        >
          {hint}
        </p>
      ) : null}
    </Link>
  );
}

export function PanelQuickAction({
  label,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="hb-panel-card group flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-xl text-[var(--hb-p-primary)]"
        style={{
          background:
            "color-mix(in srgb, var(--hb-p-primary) 14%, transparent)",
        }}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="hb-text block text-sm font-bold">{label}</span>
        <span className="hb-muted block text-xs">{hint}</span>
      </span>
    </Link>
  );
}

export function PanelEmpty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--hb-p-border-strong)] px-4 py-8 text-center">
      <p className="hb-text text-sm font-bold">{title}</p>
      <p className="hb-muted mx-auto mt-1 max-w-sm text-xs">{description}</p>
      {children ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
