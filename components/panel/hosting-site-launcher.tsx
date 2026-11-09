"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, Loader2, Plus, Server, Sparkles } from "lucide-react";

import {
  HOSTING_SITE_TYPE_DESCRIPTIONS,
  HOSTING_SITE_TYPE_LABELS,
  HOSTING_SITE_TYPES,
  type HostingSiteType,
} from "@/lib/hosting/customer-hosting-sites";
import { cn } from "@/lib/utils";

type Props = {
  orderId: string;
  planName: string;
  defaultDomain: string | null;
  remainingSlots: number | null;
};

export function HostingSiteLauncher({
  orderId,
  planName,
  defaultDomain,
  remainingSlots,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<HostingSiteType>("wordpress");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState(defaultDomain ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const limitReached = remainingSlots != null && remainingSlots <= 0;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/hosting/sites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, type, name, domain: domain.trim() }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "Could not create the website.");
        return;
      }
      setDone(true);
      setOpen(false);
      setName("");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={limitReached}
          className="hb-btn hb-btn-primary inline-flex items-center gap-2 disabled:opacity-60"
        >
          <Plus className="size-4" />
          Create a website
        </button>
        {limitReached ? (
          <p className="hb-muted text-xs">
            {planName} has reached its website limit. Upgrade the plan in Orbit
            requests to add another site.
          </p>
        ) : null}
        {done ? (
          <p className="hb-pill hb-pill-ok inline-flex" role="status">
            Website requested. Our team provisions it on the {planName} plan and
            emails you the admin details.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="hb-soft space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="hb-text text-sm font-bold">New website on {planName}</p>
          <p className="hb-muted mt-0.5 text-xs">
            Pick what you are building — we set up the right stack.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="hb-muted text-xs font-semibold hover:underline"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {HOSTING_SITE_TYPES.map((option) => {
          const active = type === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition",
                active
                  ? "border-[var(--hb-p-primary)] bg-[var(--hb-p-primary)]/10"
                  : "border-[var(--hb-p-border)] hover:border-[var(--hb-p-border-strong)]",
              )}
            >
              <span className="hb-text block text-sm font-bold">
                {HOSTING_SITE_TYPE_LABELS[option]}
              </span>
              <span className="hb-muted mt-0.5 block text-xs leading-relaxed">
                {HOSTING_SITE_TYPE_DESCRIPTIONS[option]}
              </span>
            </button>
          );
        })}
      </div>

      <label className="block">
        <span className="hb-label">Site name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My shop"
          className="hb-input h-11"
          maxLength={60}
          required
        />
      </label>

      <label className="block">
        <span className="hb-label">
          Domain <span className="hb-muted font-normal">(optional)</span>
        </span>
        <div className="relative">
          <Globe2 className="hb-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="hb-input h-11 pl-9"
            inputMode="url"
            autoCapitalize="none"
          />
        </div>
        <span className="hb-muted mt-1 block text-xs">
          Leave blank to start on a temporary preview address and connect a
          domain later.
        </span>
      </label>

      {error ? (
        <p className="hb-pill hb-pill-danger inline-flex" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={busy || name.trim().length < 2}
          className="hb-btn hb-btn-primary inline-flex items-center gap-2 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : type === "wordpress" ? (
            <Server className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {busy ? "Creating…" : `Create ${HOSTING_SITE_TYPE_LABELS[type]}`}
        </button>
        <span className="hb-muted text-xs">
          No extra charge — this uses your {planName} plan.
        </span>
      </div>
    </form>
  );
}
