"use client";

import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  enrollOrbitPasskey,
  signInWithOrbitPasskey,
} from "@/lib/orbit/webauthn-client";

export function OrbitPasskeyPanel() {
  const router = useRouter();
  const [enrollmentSecret, setEnrollmentSecret] = useState("");
  const [mode, setMode] = useState<"idle" | "enrolling" | "signing">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const busy = mode !== "idle";

  async function enroll(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setMode("enrolling");
    setMessage("");
    setError("");
    const result = await enrollOrbitPasskey({
      enrollmentSecret,
      fetchImpl: fetch,
      createCredential: (options) =>
        startRegistration({
          optionsJSON: options as Parameters<
            typeof startRegistration
          >[0]["optionsJSON"],
        }),
    });
    if (!result.ok) {
      setMode("idle");
      setError(result.message);
      return;
    }
    setEnrollmentSecret("");
    setMode("idle");
    setMessage("Passkey enrolled. Opening Orbit…");
    router.replace("/orbit");
    router.refresh();
  }

  async function signIn() {
    if (busy) return;
    setMode("signing");
    setMessage("");
    setError("");
    const result = await signInWithOrbitPasskey({
      fetchImpl: fetch,
      getCredential: (options) =>
        startAuthentication({
          optionsJSON: options as Parameters<
            typeof startAuthentication
          >[0]["optionsJSON"],
        }),
    });
    if (!result.ok) {
      setMode("idle");
      setError(result.message);
      return;
    }
    setMode("idle");
    setMessage("Opening Orbit…");
    router.replace("/orbit");
    router.refresh();
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <p className="text-center text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
        Passkey
      </p>
      <form onSubmit={enroll} className="mt-3 space-y-3">
        <label
          className="block text-sm text-slate-600"
          htmlFor="orbit-enrollment-secret"
        >
          First passkey enrollment secret
          <input
            id="orbit-enrollment-secret"
            type="password"
            name="orbit-enrollment-secret"
            autoComplete="off"
            value={enrollmentSecret}
            onChange={(event) => setEnrollmentSecret(event.target.value)}
            disabled={busy}
            className="mt-2 h-12 w-full rounded-full border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 outline-none focus-visible:border-[var(--hb-blue)]/55 focus-visible:bg-white"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !enrollmentSecret.trim()}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-800 disabled:opacity-50"
        >
          {mode === "enrolling" ? "Waiting for passkey…" : "Enroll passkey"}
        </button>
      </form>
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white disabled:opacity-50"
      >
        {mode === "signing" ? "Waiting for passkey…" : "Sign in with passkey"}
      </button>
      <p className="mt-3 min-h-5 text-center text-sm" role="status">
        {error ? <span className="text-red-600">{error}</span> : null}
        {message ? <span className="text-emerald-700">{message}</span> : null}
      </p>
    </div>
  );
}
