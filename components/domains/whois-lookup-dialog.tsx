"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";

import { whoisComLookupUrl } from "@/lib/domains/whois-com";
import { useTranslate } from "@/lib/i18n/use-translate";

export function WhoisLookupDialog({
  domain,
  onClose,
}: {
  domain: string;
  onClose: () => void;
}) {
  const tx = useTranslate();
  const href = whoisComLookupUrl(domain);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  if (!href || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#1a1035]/55 p-0 sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hb-whois-title"
        className="flex h-[min(92dvh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_28px_80px_-24px_rgba(26,16,53,0.55)] sm:h-[min(86dvh,760px)] sm:rounded-[22px]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-wide text-[#673de6] uppercase">
              whois.com
            </p>
            <h2
              id="hb-whois-title"
              className="truncate text-[16px] font-extrabold text-[#1a1035] sm:text-[18px]"
            >
              {tx("WHOIS lookup")} · {domain}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-[12.5px] font-bold text-[#4c1d95] hover:bg-[#f7f4ff]"
            >
              {tx("Open whois.com")}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label={tx("Close")}
            >
              <X className="size-4" />
            </button>
          </div>
        </header>
        <iframe
          title={`WHOIS for ${domain} on whois.com`}
          src={href}
          className="min-h-0 w-full flex-1 border-0 bg-slate-50"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <p className="shrink-0 border-t border-slate-100 px-4 py-2.5 text-[11.5px] leading-snug text-slate-500 sm:px-5">
          {tx(
            "If the record does not load here, open whois.com in a new tab. Some browsers block embedded WHOIS pages.",
          )}
        </p>
      </div>
    </div>,
    document.body,
  );
}
