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

function BrandMark({ name }: { name: "google" | "github" | "gitlab" | "ads" }) {
  if (name === "google") {
    return (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.4 44 33 44 24c0-1.3-.1-2.7-.4-3.5z"
        />
      </svg>
    );
  }
  if (name === "github") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
          className="hb-brand-github"
          fill="#181717"
          d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"
        />
      </svg>
    );
  }
  if (name === "gitlab") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path fill="#E24329" d="M12 21.4 16.6 7.2H7.4L12 21.4z" />
        <path fill="#FC6D26" d="M12 21.4 7.4 7.2H2.2L12 21.4z" />
        <path
          fill="#FCA326"
          d="M2.2 7.2 1.1 10.6c-.2.6 0 1.3.5 1.6L12 21.4 2.2 7.2z"
        />
        <path fill="#FC6D26" d="M12 21.4 16.6 7.2h5.2L12 21.4z" />
        <path
          fill="#FCA326"
          d="M21.8 7.2 22.9 10.6c.2.6 0 1.3-.5 1.6L12 21.4l9.8-14.2z"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#FBBC04"
        d="M3 18.5 10.2 4.2c.4-.8 1.5-.8 1.9 0L14 7.6 3 18.5z"
      />
      <path
        fill="#4285F4"
        d="M14 7.6 16.2 4c.5-.8 1.6-.8 2.1 0L21 9.2 14 7.6z"
      />
      <path
        fill="#34A853"
        d="M21 9.2 14.8 20c-.4.8-1.5.8-1.9 0L10 15.2 21 9.2z"
      />
    </svg>
  );
}
