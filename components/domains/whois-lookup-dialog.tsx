"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

import type { PublicWhoisRecord } from "@/lib/domains/public-whois";
import { useTranslate } from "@/lib/i18n/use-translate";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(7.5rem,34%)_minmax(0,1fr)] gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="text-[12.5px] font-bold text-slate-500">{label}</dt>
      <dd className="min-w-0 text-[13.5px] leading-snug font-semibold break-words whitespace-pre-line text-[#1a1035]">
        {value}
      </dd>
    </div>
  );
}

export function WhoisLookupDialog({
  domain,
  onClose,
}: {
  domain: string;
  onClose: () => void;
}) {
  const tx = useTranslate();
  const [record, setRecord] = useState<PublicWhoisRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRecord(null);
    void fetch(`/api/domains/whois?domain=${encodeURIComponent(domain)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const json = (await res.json()) as PublicWhoisRecord & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || json.error) {
          setError(
            json.error || tx("WHOIS details are unavailable right now."),
          );
          return;
        }
        setRecord(json);
      })
      .catch(() => {
        if (!cancelled) {
          setError(tx("WHOIS details are unavailable right now."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [domain, tx]);

  if (typeof document === "undefined") return null;

  const statuses = record?.statuses.length ? record.statuses.join("\n") : null;
  const nameservers = record?.nameServers.length
    ? record.nameServers.join("\n")
    : null;

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
        className="flex max-h-[min(92dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_28px_80px_-24px_rgba(26,16,53,0.55)] sm:rounded-[22px]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-wide text-[#673de6] uppercase">
              {tx("Domain details")}
            </p>
            <h2
              id="hb-whois-title"
              className="truncate text-[16px] font-extrabold text-[#1a1035] sm:text-[18px]"
            >
              {tx("WHOIS lookup")} · {domain}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label={tx("Close")}
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {loading ? (
            <p className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-500">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {tx("Loading WHOIS details…")}
            </p>
          ) : error ? (
            <p className="text-[13.5px] font-semibold text-slate-600">
              {error}
            </p>
          ) : record ? (
            <div className="space-y-5">
              <section>
                <h3 className="mb-1 text-[12px] font-extrabold tracking-wide text-slate-400 uppercase">
                  {tx("Domain information")}
                </h3>
                <dl>
                  <Row label={tx("Domain")} value={record.domain} />
                  {record.registeredOn ? (
                    <Row
                      label={tx("Registered on")}
                      value={record.registeredOn}
                    />
                  ) : null}
                  {record.expiresOn ? (
                    <Row label={tx("Expires on")} value={record.expiresOn} />
                  ) : null}
                  {record.updatedOn ? (
                    <Row label={tx("Updated on")} value={record.updatedOn} />
                  ) : null}
                  {statuses ? (
                    <Row label={tx("Status")} value={statuses} />
                  ) : null}
                  {nameservers ? (
                    <Row label={tx("Name servers")} value={nameservers} />
                  ) : null}
                </dl>
              </section>
              {record.registrar ? (
                <section>
                  <h3 className="mb-1 text-[12px] font-extrabold tracking-wide text-slate-400 uppercase">
                    {tx("Registrar information")}
                  </h3>
                  <dl>
                    <Row label={tx("Registrar")} value={record.registrar} />
                    {record.registrarIanaId ? (
                      <Row
                        label={tx("IANA ID")}
                        value={record.registrarIanaId}
                      />
                    ) : null}
                  </dl>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
