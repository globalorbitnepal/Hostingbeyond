"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
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
import { DomainDnsPanel } from "@/components/panel/domain-dns-panel";
import {
  daysUntil,
  domainHealth,
  domainStatusLabel,
  expiryCopy,
  formatDomainDate,
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

type Tab = "overview" | "dns" | "nameservers" | "security";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "dns", label: "DNS records" },
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

export function DomainManagePanel({
  registrationId,
  domainName,
  initialTab = "overview",
}: {
  registrationId: string;
  domainName: string;
  initialTab?: Tab;
}) {
  const [detail, setDetail] = useState<DomainDetail | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [nsInput, setNsInput] = useState("");
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch(`/api/domains/${registrationId}`, {
        cache: "no-store",
      });
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

  async function applyNameservers(hosts: string[]) {
    setNsInput(hosts.join("\n"));
    setBusy(true);
    resetFeedback();
    try {
      const res = await fetch(`/api/domains/${registrationId}/nameservers`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nameservers: hosts }),
      });
      const json = (await res.json()) as { error?: string };
      if (res.ok) {
        setMessage("Nameservers updated. Propagation can take up to 24 hours.");
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
      <p className="hb-pill hb-pill-danger inline-flex">
        <AlertTriangle className="size-3.5" />
        {loadError}
      </p>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-3">
        <p className="hb-h1">{domainName}</p>
        <div className="hb-soft h-4 w-72 animate-pulse rounded" />
        <div className="hb-soft h-32 animate-pulse rounded-xl" />
      </div>
    );
  }

  const health = domainHealth(detail.status, detail.expiresAt);
  const tone = healthTone(health);
  const days = daysUntil(detail.expiresAt);
  const needsRenewal = days !== null && days <= 45;
  const usesHostingBeyondNs = detail.nameservers.some((ns) =>
    /ns1\.hostingbeyond\.com/i.test(ns),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/account/my-domains"
            className="hb-muted hover:hb-text mb-2 inline-flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="size-3.5" />
            Domain portfolio
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="hb-h1 truncate">{detail.domain}</h1>
            <span className={cn("hb-pill", tone.pillClass)}>{tone.label}</span>
          </div>
          <p className="hb-muted mt-1 text-sm">
            {domainStatusLabel(detail.status)} · {expiryCopy(detail.expiresAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://${detail.domain}`}
            target="_blank"
            rel="noreferrer"
            className="hb-btn hb-btn-ghost"
          >
            <Globe className="size-4" />
            Visit site
          </a>
          {needsRenewal ? (
            <span className="hb-pill hb-pill-warn">
              <AlertTriangle className="size-3.5" />
              Renew soon
            </span>
          ) : null}
        </div>
      </div>

      {health === "expiring" ||
      health === "critical" ||
      health === "expired" ? (
        <div className="hb-panel-card flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--hb-p-warn)]" />
          <div className="text-sm">
            <p className="hb-text font-bold">
              {health === "expired"
                ? "This domain has expired."
                : `This domain expires ${expiryCopy(detail.expiresAt).toLowerCase()}.`}
            </p>
            <p className="hb-muted mt-0.5">
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

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-bold transition",
              tab === item.id
                ? "text-white"
                : "hb-muted hover:bg-[var(--hb-p-primary)]/10",
            )}
            style={
              tab === item.id
                ? {
                    background:
                      "linear-gradient(135deg, var(--hb-p-primary-strong), var(--hb-p-accent))",
                  }
                : undefined
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="hb-pill hb-pill-ok inline-flex">
          <CheckCircle2 className="size-3.5" />
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="hb-pill hb-pill-danger inline-flex">
          <AlertTriangle className="size-3.5" />
          {error}
        </p>
      ) : null}

      {tab === "overview" ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Status", value: domainStatusLabel(detail.status) },
              {
                label: "Registered",
                value: formatDomainDate(detail.registeredAt),
              },
              { label: "Expires", value: formatDomainDate(detail.expiresAt) },
              {
                label: "Renewal price",
                value:
                  detail.renewalPrice != null
                    ? `${formatMoney(detail.renewalPrice, detail.currency)}/yr`
                    : "—",
              },
            ].map((item) => (
              <div key={item.label} className="hb-panel-stat px-4 py-3">
                <p className="hb-muted text-[11px] font-bold tracking-wide uppercase">
                  {item.label}
                </p>
                <p className="hb-text mt-1 text-sm font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="hb-panel-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="hb-text text-sm font-bold">Auto-renew</h3>
                <p className="hb-muted mt-0.5 text-xs">
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
                  "hb-btn",
                  detail.autoRenew ? "hb-btn-ghost" : "hb-btn-primary",
                )}
              >
                <RefreshCw className="size-4" />
                {detail.autoRenew ? "On — turn off" : "Off — turn on"}
              </button>
            </div>
          </div>

          <div className="hb-panel-card p-4">
            <h3 className="hb-text text-sm font-bold">
              Point this domain somewhere
            </h3>
            <p className="hb-muted mt-1 text-xs">
              Nameservers decide where DNS lives. If this domain uses
              HostingBeyond nameservers you can edit records in the DNS tab.
            </p>
            <ul className="hb-text-soft mt-2 space-y-1 font-mono text-xs">
              {detail.nameservers.length === 0 ? (
                <li className="hb-muted">No nameservers on file.</li>
              ) : (
                detail.nameservers.map((ns) => <li key={ns}>{ns}</li>)
              )}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTab("nameservers")}
                className="hb-btn hb-btn-ghost hb-btn-sm"
              >
                Edit nameservers
              </button>
              <button
                type="button"
                onClick={() => setTab("dns")}
                className="hb-btn hb-btn-ghost hb-btn-sm"
              >
                DNS records
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "dns" ? (
        <div className="hb-panel-card p-5">
          {usesHostingBeyondNs ? null : (
            <p className="hb-pill hb-pill-warn mb-4 rounded-xl px-3 py-2 text-xs">
              <AlertTriangle className="size-3.5" />
              This domain uses third-party nameservers. Records here are stored
              at the registrar but DNS answers come from those nameservers.
            </p>
          )}
          <DomainDnsPanel
            registrationId={registrationId}
            domainName={detail.domain}
          />
        </div>
      ) : null}

      {tab === "nameservers" ? (
        <div className="hb-panel-card p-5">
          <h3 className="hb-text text-sm font-bold">Nameservers</h3>
          <p className="hb-muted mt-1 text-xs">
            One hostname per line. Most registrars require at least two.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void applyNameservers([
                  "ns1.hostingbeyond.com",
                  "ns2.hostingbeyond.com",
                ])
              }
              className="hb-btn hb-btn-ghost hb-btn-sm"
            >
              Use HostingBeyond nameservers
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setNsInput(detail.nameservers.join("\n"))}
              className="hb-btn hb-btn-ghost hb-btn-sm"
            >
              Reset to saved
            </button>
          </div>
          <textarea
            className="hb-textarea mt-3 font-mono"
            rows={4}
            value={nsInput}
            onChange={(e) => setNsInput(e.target.value)}
            spellCheck={false}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveNameservers()}
            className="hb-btn hb-btn-primary mt-3"
          >
            {busy ? "Saving…" : "Save nameservers"}
          </button>
        </div>
      ) : null}

      {tab === "security" ? (
        <div className="space-y-3">
          <div className="hb-panel-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="hb-text flex items-center gap-2 text-sm font-bold">
                  {detail.transferLock ? (
                    <Lock className="size-4 text-[var(--hb-p-ok)]" />
                  ) : (
                    <Unlock className="size-4 text-[var(--hb-p-warn)]" />
                  )}
                  Transfer lock {detail.transferLock ? "enabled" : "disabled"}
                </h3>
                <p className="hb-muted mt-1 max-w-lg text-xs">
                  {detail.transferLock
                    ? "Locked domains cannot be moved to another registrar without your auth code. This is the safe default."
                    : "Anyone with your auth code can start a transfer right now."}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleLock(!detail.transferLock)}
                className="hb-btn hb-btn-ghost"
              >
                {detail.transferLock ? "Unlock domain" : "Lock domain"}
              </button>
            </div>
          </div>

          <div className="hb-panel-card p-4">
            <h3 className="hb-text flex items-center gap-2 text-sm font-bold">
              <KeyRound className="size-4 text-[var(--hb-p-primary)]" />
              Authorisation (EPP) code
            </h3>
            <p className="hb-muted mt-1 text-xs">
              Needed when transferring this domain away. Unlock the domain
              first, then request the code.
            </p>
            {authCode ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="hb-soft hb-text rounded-lg px-3 py-2 font-mono text-sm">
                  {authCode}
                </code>
                <button
                  type="button"
                  onClick={() => void copyAuthCode()}
                  className="hb-btn hb-btn-ghost hb-btn-sm"
                >
                  {copied ? (
                    <CheckCircle2 className="size-3.5" />
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
              className="hb-btn hb-btn-primary mt-3"
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

      <p className="hb-faint text-xs">
        Need help?{" "}
        <Link href="/account/support" className="hb-link">
          Open a support ticket
        </Link>
      </p>
    </div>
  );
}
