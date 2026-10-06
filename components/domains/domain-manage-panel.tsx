"use client";

import { useCallback, useEffect, useState } from "react";

import { DomainRenewButton } from "@/components/domains/domain-renew-button";

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

export function DomainManagePanel({
  registrationId,
  domainName,
}: {
  registrationId: string;
  domainName: string;
}) {
  const [detail, setDetail] = useState<DomainDetail | null>(null);
  const [nsInput, setNsInput] = useState("");
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/domains/${registrationId}`);
    if (!res.ok) return;
    const json = (await res.json()) as { domain?: DomainDetail };
    if (json.domain) {
      setDetail(json.domain);
      setNsInput(json.domain.nameservers.join("\n"));
    }
  }, [registrationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveNameservers() {
    setLoading(true);
    setMessage(null);
    const nameservers = nsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch(`/api/domains/${registrationId}/nameservers`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nameservers }),
    });
    const json = (await res.json()) as { error?: string };
    setMessage(
      res.ok ? "Nameservers updated." : (json.error ?? "Update failed."),
    );
    setLoading(false);
    if (res.ok) void load();
  }

  async function toggleLock(locked: boolean) {
    if (
      !locked &&
      !window.confirm(
        "Unlocking allows transfers away from HostingBeyond. Continue?",
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/domains/${registrationId}/lock`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locked }),
    });
    const json = (await res.json()) as { error?: string };
    setMessage(res.ok ? "Lock status updated." : (json.error ?? "Failed."));
    setLoading(false);
    if (res.ok) void load();
  }

  async function fetchAuthCode() {
    setLoading(true);
    setMessage(null);
    setAuthCode(null);
    const res = await fetch(`/api/domains/${registrationId}/auth-code`);
    const json = (await res.json()) as { authCode?: string; error?: string };
    if (res.ok && json.authCode) setAuthCode(json.authCode);
    else setMessage(json.error ?? "Could not load auth code.");
    setLoading(false);
  }

  if (!detail) {
    return <p className="text-sm text-slate-500">Loading domain…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{domainName}</h2>
        <p className="text-sm text-slate-600">Status: {detail.status}</p>
        {detail.expiresAt ? (
          <p className="text-sm text-slate-600">
            Expires: {new Date(detail.expiresAt).toLocaleDateString()}
          </p>
        ) : null}
        <p className="text-sm text-slate-600">
          Transfer lock: {detail.transferLock ? "On" : "Off"}
        </p>
      </div>

      {detail.renewalPrice != null ? (
        <DomainRenewButton domain={detail.domain} />
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-slate-800">Nameservers</h3>
        <textarea
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          rows={4}
          value={nsInput}
          onChange={(e) => setNsInput(e.target.value)}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void saveNameservers()}
          className="mt-2 rounded-full bg-[#673de6] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          Save nameservers
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void toggleLock(true)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
        >
          Lock domain
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void toggleLock(false)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
        >
          Unlock domain
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void fetchAuthCode()}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
        >
          Show auth code
        </button>
      </div>

      {authCode ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 font-mono text-sm">
          {authCode}
        </p>
      ) : null}
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
