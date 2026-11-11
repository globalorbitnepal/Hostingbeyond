"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Star, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function PanelGiveFeedback({
  collapsed,
  trustpilotUrl,
  trustpilotLabel,
}: {
  collapsed: boolean;
  trustpilotUrl?: string;
  trustpilotLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shown = hover || rating;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="hb-panel-dock-btn"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Give feedback"
        onClick={() => setOpen((value) => !value)}
      >
        <MessageSquare className="size-4 shrink-0" strokeWidth={2.2} />
        {!collapsed ? <span>Give feedback</span> : null}
      </button>

      {open ? (
        <div
          className="hb-panel-rate"
          role="dialog"
          aria-label="How would you rate your experience?"
        >
          <button
            type="button"
            className="hb-panel-rate__close"
            aria-label="Close feedback"
            onClick={() => setOpen(false)}
          >
            <X className="size-3.5" />
          </button>
          <p className="hb-panel-rate__title">
            How would you rate your experience?
          </p>
          <div
            className="hb-panel-rate__stars"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={cn("hb-panel-rate__star", shown >= value && "is-on")}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                onMouseEnter={() => setHover(value)}
                onFocus={() => setHover(value)}
                onClick={() => setRating(value)}
              >
                <Star
                  className="size-6"
                  strokeWidth={2}
                  fill={shown >= value ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <div className="hb-panel-rate__ends">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
          {rating > 0 ? (
            <div className="hb-panel-rate__done">
              <p>Thanks — that helps us improve HostingBeyond.</p>
              {trustpilotUrl ? (
                <a
                  href={trustpilotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hb-panel-rate__trust"
                >
                  {trustpilotLabel || "Continue on Trustpilot"}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
