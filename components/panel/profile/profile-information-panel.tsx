"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, User } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/panel/profile/brand-marks";
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
        <div className="hb-profile-row">
          <p className="hb-profile-row__label">
            <BrandMark name="google" /> Google
          </p>
          <p className="hb-text text-sm font-semibold">
            {google ? "Connected" : "Not connected"}
          </p>
          {google ? (
            <button
              type="button"
              className="hb-btn hb-btn-ghost hb-btn-sm"
              onClick={async () => {
                setError(null);
                const result = await profileAction({
                  action: "unlink-oauth",
                  provider: "google",
                });
                if (!result.ok) setError(result.error ?? "Could not unlink.");
                else router.refresh();
              }}
            >
              Unlink
            </button>
          ) : (
            <a
              className="hb-btn hb-btn-ghost hb-btn-sm"
              href={`/api/auth/oauth/google?next=${encodeURIComponent(routes.accountProfile)}`}
            >
              Connect
            </a>
          )}
        </div>
        <div className="hb-profile-row">
          <p className="hb-profile-row__label">
            <BrandMark name="github" /> GitHub
          </p>
          <p className="hb-muted text-sm">
            {github ? "Connected" : "Coming soon"}
          </p>
          {github ? (
            <button
              type="button"
              className="hb-btn hb-btn-ghost hb-btn-sm"
              onClick={async () => {
                setError(null);
                const result = await profileAction({
                  action: "unlink-oauth",
                  provider: "github",
                });
                if (!result.ok) setError(result.error ?? "Could not unlink.");
                else router.refresh();
              }}
            >
              Unlink
            </button>
          ) : (
            <span className="hb-pill hb-pill-neutral">Coming soon</span>
          )}
        </div>
      </section>

      <section className="hb-profile-card">
        <h2 className="hb-profile-card__title">Account integrations</h2>
        {(
          [
            ["github", "GitHub"],
            ["gitlab", "GitLab"],
            ["ads", "Google Ads"],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="hb-profile-row">
            <p className="hb-profile-row__label">
              <BrandMark name={name} /> {label}
            </p>
            <p className="hb-muted text-sm">Coming soon</p>
            <span className="hb-pill hb-pill-neutral">Coming soon</span>
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
