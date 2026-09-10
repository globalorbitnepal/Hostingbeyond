"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { HostingBeyondLogo } from "@/components/shared/hostingbeyond-logo";

export function OrbitLoginForm() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const errorId = useId();
  const [accessKey, setAccessKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const submitting = status === "loading";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/orbit/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Invalid access key");
      }
      setStatus("success");
      setAccessKey("");
      router.replace("/orbit");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Invalid access key",
      );
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050b18] px-4 py-10 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,107,255,0.14),transparent_52%),radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.1),transparent_48%)]" />
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,#050b18_100%)]" />
      </div>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
        className="relative w-full max-w-[420px]"
      >
        <div className="mb-7 flex justify-center">
          <HostingBeyondLogo className="h-8 w-auto opacity-90 sm:h-9" />
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-[#0b1428]/78 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <div className="flex items-start gap-3.5">
            <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--hb-blue)]/25 bg-[var(--hb-blue)]/10 text-[var(--hb-blue)]">
              <Shield className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400 uppercase">
                Orbit
              </p>
              <h1 className="mt-1 text-[1.65rem] leading-none font-semibold tracking-tight text-white">
                Super Admin
              </h1>
            </div>
          </div>

          <p className="mt-5 text-[13.5px] leading-relaxed text-slate-400">
            Secure access to HostingBeyond infrastructure.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="orbit-access-key"
                className="text-[11px] font-semibold tracking-[0.18em] text-slate-300 uppercase"
              >
                Access key
              </label>
              <div className="relative mt-2">
                <input
                  id="orbit-access-key"
                  type={showKey ? "text" : "password"}
                  name="orbit-access-key"
                  autoComplete="current-password"
                  value={accessKey}
                  onChange={(event) => setAccessKey(event.target.value)}
                  disabled={submitting}
                  aria-invalid={status === "error"}
                  aria-describedby={status === "error" ? errorId : undefined}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#060d1c] px-3.5 pr-12 text-sm text-white outline-none transition-[border-color,box-shadow] placeholder:text-slate-500 focus-visible:border-[var(--hb-blue)]/55 focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/25 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Enter your Orbit access key"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey((open) => !open)}
                  disabled={submitting}
                  className="absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/40 disabled:opacity-50"
                  aria-label={showKey ? "Hide access key" : "Show access key"}
                  aria-pressed={showKey}
                >
                  {showKey ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !accessKey.trim()}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] text-sm font-semibold text-white shadow-[0_10px_28px_rgba(47,107,255,0.22)] outline-none transition-[filter,transform,opacity] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/50 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              {submitting ? "Authenticating…" : "Open Orbit Dashboard"}
            </button>
          </form>

          <div
            id={errorId}
            role="status"
            aria-live="polite"
            className="min-h-6 pt-4 text-center text-sm"
          >
            {status === "error" && message ? (
              <p className="text-red-300/95">{message}</p>
            ) : null}
            {status === "success" ? (
              <p className="text-emerald-300/90">Opening Orbit…</p>
            ) : null}
          </div>
        </div>
      </motion.section>
    </main>
  );
}
