"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  email: string;
  hasPassword: boolean;
};

export function AccountSecurityPanel({ email, hasPassword }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#673de6] focus:ring-4 focus:ring-[#673de6]/12 focus:outline-none";

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
    <form className="mt-8 space-y-5" onSubmit={(e) => void onSubmit(e)}>
      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <KeyRound className="mt-0.5 size-5 shrink-0 text-[#673de6]" />
        <div className="min-w-0 text-sm leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-900">
            {hasPassword ? "Change password" : "Set a password"}
          </p>
          <p className="mt-1">
            Signed in as{" "}
            <span className="font-medium text-slate-800">{email}</span>.
            {hasPassword
              ? " Enter your current password, then choose a new one."
              : " You signed in with Google, GitHub, or Facebook — add a password to sign in with email too."}
          </p>
        </div>
      </div>

      {hasPassword ? (
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
            Current password
          </span>
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
        <p
          className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          Your password has been updated. Use it the next time you sign in with
          email.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#673de6] to-[#2563eb] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60",
        )}
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
