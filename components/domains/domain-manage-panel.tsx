"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Globe,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
} from "lucide-react";

import { DomainRenewButton } from "@/components/domains/domain-renew-button";
import {
  daysUntil,
  domainHealth,
  domainStatusLabel,
  expiryCopy,
  healthTone,
} from "@/lib/panel/domain-status";
import { cn } from "@/lib/utils";

type DomainDetail = {
  id: string;
  domain: string;
  status: string;
  expiresAt: string | null;
  registeredAt: string | null;
  autoRenew: boolean;
  nameservers: string[];
  transferLock: boolean;
  renewalPrice: number | null;
  currency: string;
};

type Tab = "overview" | "nameservers" | "security";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "nameservers", label: "Nameservers" },
  { id: "security", label: "Lock & transfer" },
];

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export function DomainManagePanel({
  registrationId,
  domainName,
}: {
  registrationId: string;
  domainName: string;
}) {
  const [detail, setDetail] = useState<DomainDetail | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [nsInput, setNsInput] = useState("");
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch(`/api/domains/${registrationId}`);
      if (!res.ok) {
        setLoadError("Could not load this domain right now.");
        return;
      }
      const json = (await res.json()) as { domain?: DomainDetail };
      if (json.domain) {
        setDetail(json.domain);
        setNsInput(json.domain.nameservers.join("\n"));
      }
    } catch {
      setLoadError("Network error while loading this domain.");
    }
  }, [registrationId]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetFeedback() {
    setMessage(null);
    setError(null);
  }

  async function saveNameservers() {
    setBusy(true);
    resetFeedback();
    const nameservers = nsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch(`/api/domains/${registrationId}/nameservers`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nameservers }),
      });
      const json = (await res.json()) as { error?: string };
      if (res.ok) {
        setMessage("Nameservers saved. DNS updates can take up to 24 hours.");
        void load();
      } else {
        setError(json.error ?? "Nameservers could not be updated.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleLock(locked: boolean) {
    if (
      !locked &&
      !window.confirm(
        "Turning the transfer lock off lets this domain be moved to another registrar. Continue?",
      )
    ) {
      return;
    }
    setBusy(true);
    resetFeedback();
    try {
      const res = await fetch(`/api/domains/${registrationId}/lock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locked }),
      });
      const json = (await res.json()) as { error?: string };
      if (res.ok) {
        setMessage(
          locked ? "Transfer lock enabled." : "Transfer lock disabled.",
        );
        void load();
      } else {
        setError(json.error ?? "Lock status could not be updated.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleAutoRenew(autoRenew: boolean) {
    setBusy(true);
    resetFeedback();
    try {
      const res = await fetch(`/api/domains/${registrationId}/auto-renew`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ autoRenew }),
      });
      const json = (await res.json()) as { error?: string };
      if (res.ok) {
        setMessage(
          autoRenew
            ? "Auto-renew is on. We will renew this domain before it expires."
            : "Auto-renew is off. Remember to renew manually before it expires.",
        );
        void load();
      } else {
        setError(json.error ?? "Auto-renew could not be updated.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function fetchAuthCode() {
    setBusy(true);
    resetFeedback();
    setAuthCode(null);
    try {
      const res = await fetch(`/api/domains/${registrationId}/auth-code`);
      const json = (await res.json()) as { authCode?: string; error?: string };
      if (res.ok && json.authCode) setAuthCode(json.authCode);
      else setError(json.error ?? "Auth code is temporarily unavailable.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyAuthCode() {
    if (!authCode) return;
    try {
      await navigator.clipboard.writeText(authCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-3">
        <p className="font-heading text-2xl font-bold text-slate-950">
          {domainName}
        </p>
        <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  const health = domainHealth(detail.status, detail.expiresAt);
  const tone = healthTone(health);
  const days = daysUntil(detail.expiresAt);
  const needsRenewal = days !== null && days <= 45;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading truncate text-2xl font-bold text-slate-950">
              {detail.domain}
            </h2>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                tone.pill,
              )}
            >
              {tone.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {domainStatusLabel(detail.status)} · {expiryCopy(detail.expiresAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://${detail.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--hb-p-border)] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--hb-p-primary)]/40"
          >
            <Globe className="size-4" />
            Visit site
          </a>
          {needsRenewal ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
              <AlertTriangle className="size-4" />
              Renew soon
            </span>
          ) : null}
        </div>
      </div>

      {health === "expiring" ||
      health === "critical" ||
      health === "expired" ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">
              {health === "expired"
                ? "This domain has expired."
                : `This domain expires ${expiryCopy(detail.expiresAt).toLowerCase()}.`}
            </p>
            <p className="mt-0.5 text-amber-900/80">
              After expiry your website and email stop working, and the name can
              be registered by someone else.
              {detail.renewalPrice != null
                ? ` Renewal is ${formatMoney(detail.renewalPrice, detail.currency)} for one year.`
                : ""}
            </p>
            <div className="mt-2">
              <DomainRenewButton domain={detail.domain} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--hb-p-border)] pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
              tab === item.id
                ? "bg-[var(--hb-p-primary)]/10 text-[var(--hb-p-primary-deep)]"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {tab === "overview" ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Status", value: domainStatusLabel(detail.status) },
              { label: "Registered", value: formatDate(detail.registeredAt) },
              { label: "Expires", value: formatDate(detail.expiresAt) },
              {
                label: "Renewal price",
                value:
                  detail.renewalPrice != null
                    ? `${formatMoney(detail.renewalPrice, detail.currency)}/yr`
                    : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[var(--hb-p-border)] bg-white px-4 py-3"
              >
                <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--hb-p-border)] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Auto-renew</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {detail.autoRenew
                    ? "We keep this domain active automatically before expiry."
                    : "You will need to renew manually before the expiry date."}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleAutoRenew(!detail.autoRenew)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-60",
                  detail.autoRenew
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
                )}
              >
                <RefreshCw className="size-4" />
                {detail.autoRenew ? "On — turn off" : "Off — turn on"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--hb-p-border)] bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900">
              Point this domain somewhere
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              To use it with hosting or email, set the nameservers to your
              provider. Current nameservers:
            </p>
            <ul className="mt-2 space-y-1 font-mono text-xs text-slate-700">
              {detail.nameservers.length === 0 ? (
                <li className="text-slate-500">No nameservers on file.</li>
              ) : (
                detail.nameservers.map((ns) => <li key={ns}>{ns}</li>)
              )}
            </ul>
            <button
              type="button"
              onClick={() => setTab("nameservers")}
              className="mt-3 text-sm font-semibold text-[var(--hb-p-primary)] hover:underline"
            >
              Edit nameservers →
            </button>
          </div>
        </div>
      ) : null}

      {tab === "nameservers" ? (
        <div className="rounded-xl border border-[var(--hb-p-border)] bg-white p-4">
          <h3 className="text-sm font-bold text-slate-900">Nameservers</h3>
          <p className="mt-1 text-xs text-slate-500">
            One hostname per line, for example <code>ns1.example.com</code>.
            Most providers require at least two.
          </p>
          <textarea
            className="mt-3 w-full rounded-xl border border-[var(--hb-p-border)] px-3 py-2 font-mono text-sm"
            rows={4}
            value={nsInput}
            onChange={(e) => setNsInput(e.target.value)}
            spellCheck={false}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveNameservers()}
            className="mt-3 rounded-xl bg-[var(--hb-p-primary)] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save nameservers"}
          </button>
        </div>
      ) : null}

      {tab === "security" ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--hb-p-border)] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {detail.transferLock ? (
                    <Lock className="size-4 text-emerald-600" />
                  ) : (
                    <Unlock className="size-4 text-amber-600" />
                  )}
                  Transfer lock {detail.transferLock ? "enabled" : "disabled"}
                </h3>
                <p className="mt-1 max-w-lg text-xs text-slate-500">
                  {detail.transferLock
                    ? "Locked domains cannot be moved to another registrar without your auth code. This is the safe default."
                    : "Anyone with your auth code can start a transfer right now."}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleLock(!detail.transferLock)}
                className="rounded-xl border border-[var(--hb-p-border)] px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--hb-p-primary)]/40 disabled:opacity-60"
              >
                {detail.transferLock ? "Unlock domain" : "Lock domain"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--hb-p-border)] bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <KeyRound className="size-4 text-[var(--hb-p-primary)]" />
              Authorisation (EPP) code
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Needed when transferring this domain to another registrar. Unlock
              the domain first, then request the code.
            </p>
            {authCode ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 ring-1 ring-slate-200">
                  {authCode}
                </code>
                <button
                  type="button"
                  onClick={() => void copyAuthCode()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hb-p-border)] px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {copied ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void fetchAuthCode()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--hb-p-primary)] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              <ShieldCheck className="size-4" />
              {busy
                ? "Loading…"
                : authCode
                  ? "Request a new code"
                  : "Show auth code"}
            </button>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-slate-400">
        Need help?{" "}
        <Link
          href="/contact"
          className="font-semibold text-[var(--hb-p-primary)] hover:underline"
        >
          Contact support
        </Link>
      </p>
    </div>
  );
}
