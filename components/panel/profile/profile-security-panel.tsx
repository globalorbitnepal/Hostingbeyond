"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AccountSecurityPanel } from "@/components/panel/account-security-panel";
import { profileAction } from "@/components/panel/profile/profile-api";

export function ProfileSecurityPanel({
  email,
  hasPassword,
  oauth,
  totpEnabled,
}: {
  email: string;
  hasPassword: boolean;
  oauth: string[];
  totpEnabled: boolean;
}) {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError(null);
    const result = await profileAction<{ secret?: string; uri?: string }>({
      action: "totp-start",
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not start 2FA.");
      return;
    }
    setSecret(result.data.secret ?? null);
    setUri(result.data.uri ?? null);
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    const result = await profileAction({ action: "totp-confirm", code });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not enable 2FA.");
      return;
    }
    setSecret(null);
    setUri(null);
    setCode("");
    router.refresh();
  }

  async function disable() {
    setBusy(true);
    setError(null);
    const result = await profileAction({ action: "totp-disable", code });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not turn 2FA off.");
      return;
    }
    setCode("");
    router.refresh();
  }

  return (
    <>
      <header>
        <p className="hb-eyebrow">Profile</p>
        <h1 className="hb-h1 mt-1">Security</h1>
      </header>

      <section className="hb-profile-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[color-mix(in_srgb,var(--hb-p-primary)_14%,transparent)] text-[var(--hb-p-primary)]">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="hb-text text-sm font-bold">
                Mobile authentication method
              </p>
              <p className="hb-muted mt-1 text-sm">
                {totpEnabled
                  ? "Google Authenticator is linked to this HostingBeyond account."
                  : "Use Google Authenticator (or any TOTP app) for sign-in codes."}
              </p>
            </div>
          </div>
          {totpEnabled ? (
            <span className="hb-pill hb-pill-ok">On</span>
          ) : (
            <button
              type="button"
              className="hb-btn hb-btn-primary"
              disabled={busy}
              onClick={() => void start()}
            >
              Turn on
            </button>
          )}
        </div>

        {secret ? (
          <div className="mt-5 space-y-3">
            <p className="hb-text text-sm font-semibold">
              Add this key in your authenticator app, then enter the 6-digit
              code.
            </p>
            <p className="hb-soft px-3 py-2 font-mono text-sm tracking-widest">
              {secret}
            </p>
            {uri ? (
              <a className="hb-link text-sm" href={uri}>
                Open in authenticator
              </a>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <input
                className="hb-input max-w-[10rem]"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="button"
                className="hb-btn hb-btn-primary"
                disabled={busy}
                onClick={() => void confirm()}
              >
                Confirm
              </button>
            </div>
          </div>
        ) : null}

        {totpEnabled ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <input
              className="hb-input max-w-[10rem]"
              inputMode="numeric"
              placeholder="Code to turn off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              className="hb-btn hb-btn-ghost"
              disabled={busy}
              onClick={() => void disable()}
            >
              Turn off
            </button>
          </div>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm text-[var(--hb-p-danger)]">{error}</p>
        ) : null}
      </section>

      <section className="hb-profile-card p-5" id="password">
        <AccountSecurityPanel
          email={email}
          hasPassword={hasPassword}
          hasOauth={oauth.length > 0}
          providers={oauth}
        />
      </section>
    </>
  );
}
