"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

type Props = {
  email: string;
  hasPassword: boolean;
  hasOauth?: boolean;
  providers?: string[];
};

function providerLabels(providers: string[]) {
  return providers
    .map((provider) =>
      provider === "google"
        ? "Google"
        : provider === "github"
          ? "GitHub"
          : provider === "facebook"
            ? "Facebook"
            : provider,
    )
    .join(" or ");
}

export function AccountSecurityPanel({
  email,
  hasPassword,
  hasOauth = false,
  providers = [],
}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputClass = "hb-input h-11";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
          confirmPassword,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "Could not update password. Try again.");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id="password"
      className="mt-6 scroll-mt-28 space-y-5"
      onSubmit={(e) => void onSubmit(e)}
    >
      <div className="hb-soft flex items-start gap-3 px-4 py-3">
        <KeyRound className="mt-0.5 size-5 shrink-0 text-[var(--hb-p-primary)]" />
        <div className="hb-muted min-w-0 text-sm leading-relaxed">
          <p className="hb-text font-bold">
            {hasPassword ? "Change password" : "Set a password"}
          </p>
          <p className="mt-1">
            Signed in as <span className="hb-text font-semibold">{email}</span>.
            {hasPassword
              ? " Enter your current password, then choose a new one."
              : hasOauth
                ? ` You signed in with ${providerLabels(providers) || "a social account"} — set a password to sign in with email too. Your social sign-in keeps working.`
                : " Choose a password so you can sign in with email as well."}
          </p>
        </div>
      </div>

      {hasPassword ? (
        <label className="block">
          <span className="hb-label">Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            required
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
          New password
        </span>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass}
          minLength={8}
          required
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
          Confirm new password
        </span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
          minLength={8}
          required
        />
      </label>

      {error ? (
        <p className="hb-pill hb-pill-danger inline-flex" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="hb-pill hb-pill-ok inline-flex" role="status">
          Your password has been updated. Use it the next time you sign in with
          email.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="hb-btn hb-btn-primary h-11 px-6"
      >
        {submitting
          ? "Saving…"
          : hasPassword
            ? "Update password"
            : "Set password"}
      </button>
    </form>
  );
}
