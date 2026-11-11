"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, User } from "lucide-react";
import Link from "next/link";

import { ProfileField } from "@/components/panel/profile/profile-field";
import { profileAction } from "@/components/panel/profile/profile-api";
import { routes } from "@/config/routes";

export type ProfileSnapshot = {
  user: {
    name: string;
    email: string;
    hasPassword: boolean;
    createdAt: string | Date;
  };
  profile: {
    address: string;
    phone: string;
    company: string;
    displayCurrency: string;
    recoveryEmail: string;
    totpEnabled: boolean;
    integrations: { github: boolean; gitlab: boolean; googleAds: boolean };
  };
  oauth: string[];
};

export function ProfileInformationPanel({
  initial,
}: {
  initial: ProfileSnapshot;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.user.name);
  const [address, setAddress] = useState(initial.profile.address);
  const [phone, setPhone] = useState(initial.profile.phone);
  const [company, setCompany] = useState(initial.profile.company);
  const [currency, setCurrency] = useState(initial.profile.displayCurrency);
  const [recovery, setRecovery] = useState(initial.profile.recoveryEmail);
  const [gitlab, setGitlab] = useState(initial.profile.integrations.gitlab);
  const [ads, setAds] = useState(initial.profile.integrations.googleAds);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function savePersonal(patch: Record<string, string>) {
    const result = await profileAction({ action: "save-personal", ...patch });
    if (!result.ok) throw new Error(result.error);
    router.refresh();
  }

  const memberSince = new Date(initial.user.createdAt).toLocaleString();
  const google = initial.oauth.includes("google");
  const github = initial.oauth.includes("github");

  return (
    <>
      <header>
        <p className="hb-eyebrow">Profile</p>
        <h1 className="hb-h1 mt-1">Account information</h1>
      </header>
      {error ? (
        <p className="text-sm font-semibold text-[var(--hb-p-danger)]">
          {error}
        </p>
      ) : null}

      <section className="hb-profile-card">
        <h2 className="hb-profile-card__title">
          <User className="size-4" /> Personal information
        </h2>
        <p className="hb-muted px-5 pb-2 text-sm">
          These details appear on invoices and support tickets.
        </p>
        <ProfileField
          label="Name"
          value={name}
          onSave={async (next) => {
            await savePersonal({
              name: next,
              address,
              phone,
              company,
              displayCurrency: currency,
            });
            setName(next);
          }}
        />
        <ProfileField
          label="Address"
          value={address}
          onSave={async (next) => {
            await savePersonal({
              name,
              address: next,
              phone,
              company,
              displayCurrency: currency,
            });
            setAddress(next);
          }}
        />
        <ProfileField
          label="Phone number"
          value={phone}
          type="tel"
          onSave={async (next) => {
            await savePersonal({
              name,
              address,
              phone: next,
              company,
              displayCurrency: currency,
            });
            setPhone(next);
          }}
        />
        <ProfileField
          label="Company"
          value={company}
          onSave={async (next) => {
            await savePersonal({
              name,
              address,
              phone,
              company: next,
              displayCurrency: currency,
            });
            setCompany(next);
          }}
        />
        <ProfileField
          label="Account currency"
          value={currency}
          type="select"
          options={["USD", "EUR", "INR", "NPR", "GBP"].map((code) => ({
            value: code,
            label: code,
          }))}
          onSave={async (next) => {
            await savePersonal({
              name,
              address,
              phone,
              company,
              displayCurrency: next,
            });
            setCurrency(next);
          }}
        />
      </section>

      <section className="hb-profile-card">
        <h2 className="hb-profile-card__title">Account settings</h2>
        <div className="hb-profile-row">
          <p className="hb-profile-row__label">Email</p>
          <p className="hb-profile-row__value hb-text text-sm font-semibold">
            {initial.user.email}
          </p>
          <span />
        </div>
        <ProfileField
          label="Recovery email"
          value={recovery}
          type="email"
          onSave={async (next) => {
            const result = await profileAction({
              action: "save-account",
              recoveryEmail: next,
            });
            if (!result.ok) throw new Error(result.error);
            setRecovery(next);
          }}
        />
        <div className="hb-profile-row">
          <p className="hb-profile-row__label">
            {initial.user.hasPassword ? "Password" : "Add password"}
          </p>
          <p className="hb-muted text-sm">
            {initial.user.hasPassword ? "••••••••" : "Not set"}
          </p>
          <Link
            href={`${routes.accountProfileSecurity}#password`}
            className="hb-profile-row__edit"
            aria-label="Change password"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="hb-profile-row">
          <p className="hb-profile-row__label">
            Manage two-factor authentication
          </p>
          <p className="hb-text text-sm font-semibold">
            {initial.profile.totpEnabled ? "Enabled" : "Off"}
          </p>
          <Link
            href={routes.accountProfileSecurity}
            className="hb-profile-row__edit"
            aria-label="Open two-factor authentication"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <div className="hb-profile-row">
          <p className="hb-profile-row__label">Member since</p>
          <p className="hb-text text-sm font-semibold">{memberSince}</p>
          <span />
        </div>
      </section>

      <section className="hb-profile-card">
        <h2 className="hb-profile-card__title">Social logins</h2>
        {(["google", "github"] as const).map((provider) => {
          const connected = provider === "google" ? google : github;
          return (
            <div key={provider} className="hb-profile-row">
              <p className="hb-profile-row__label capitalize">{provider}</p>
              <p className="hb-text text-sm font-semibold">
                {connected ? "Connected" : "Not connected"}
              </p>
              {connected ? (
                <button
                  type="button"
                  className="hb-btn hb-btn-ghost hb-btn-sm"
                  onClick={async () => {
                    setError(null);
                    const result = await profileAction({
                      action: "unlink-oauth",
                      provider,
                    });
                    if (!result.ok)
                      setError(result.error ?? "Could not unlink.");
                    else router.refresh();
                  }}
                >
                  Unlink
                </button>
              ) : (
                <a
                  className="hb-btn hb-btn-ghost hb-btn-sm"
                  href={`/api/auth/oauth/${provider}?next=${encodeURIComponent(routes.accountProfile)}`}
                >
                  Connect
                </a>
              )}
            </div>
          );
        })}
      </section>

      <section className="hb-profile-card">
        <h2 className="hb-profile-card__title">Account integrations</h2>
        <div className="hb-profile-row">
          <p className="hb-profile-row__label">GitHub</p>
          <p className="hb-muted text-sm">
            {github ? "Connected with your GitHub login" : "Not connected"}
          </p>
          {github ? (
            <span className="hb-pill hb-pill-ok">Connected</span>
          ) : (
            <a
              className="hb-btn hb-btn-ghost hb-btn-sm"
              href={`/api/auth/oauth/github?next=${encodeURIComponent(routes.accountProfile)}`}
            >
              Connect
            </a>
          )}
        </div>
        {(
          [
            ["gitlab", "GitLab", gitlab, setGitlab],
            ["googleAds", "Google Ads", ads, setAds],
          ] as const
        ).map(([id, label, connected, setConnected]) => (
          <div key={id} className="hb-profile-row">
            <p className="hb-profile-row__label">{label}</p>
            <p className="hb-muted text-sm">
              {connected ? "Connected on this account" : "Not connected"}
            </p>
            <button
              type="button"
              className="hb-btn hb-btn-ghost hb-btn-sm"
              onClick={async () => {
                const result = await profileAction({
                  action: "set-integration",
                  id,
                  connected: !connected,
                });
                if (!result.ok) setError(result.error ?? "Could not update.");
                else setConnected(!connected);
              }}
            >
              {connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </section>

      <section className="hb-profile-card">
        <h2 className="hb-profile-card__title">Account</h2>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="hb-text text-sm font-bold">Delete account</p>
            <p className="hb-muted mt-1 max-w-lg text-xs">
              This signs you out and removes this customer login. Type your
              email to confirm — this cannot be undone from the panel.
            </p>
            <input
              className="hb-input mt-3 max-w-sm"
              placeholder={initial.user.email}
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="hb-btn hb-btn-danger"
            onClick={async () => {
              setError(null);
              const result = await profileAction({
                action: "delete-account",
                confirmEmail: deleteEmail,
              });
              if (!result.ok) {
                setError(result.error ?? "Could not delete account.");
                return;
              }
              window.location.href = routes.signup;
            }}
          >
            Delete account
          </button>
        </div>
      </section>
    </>
  );
}
