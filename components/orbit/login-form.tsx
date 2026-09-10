"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  Globe,
  ImageIcon,
  KeyRound,
  Loader2,
  Server,
  Shield,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { HostingBeyondLogo } from "@/components/shared/hostingbeyond-logo";

const capabilities = [
  { label: "Website management", icon: Globe },
  { label: "Images & media", icon: ImageIcon },
  { label: "Pages & content", icon: FileText },
  { label: "Infrastructure control", icon: Server },
] as const;

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
    <main className="relative min-h-dvh overflow-hidden bg-[#f3f7fc] text-slate-900">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/hero-atmosphere.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,251,255,0.94)_0%,rgba(248,251,255,0.78)_42%,rgba(241,247,255,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(47,107,255,0.08),transparent_42%)]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <HostingBeyondLogo className="h-9 w-auto sm:h-10" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm outline-none backdrop-blur-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/30"
          >
            <ArrowLeft className="size-4" />
            Back to website
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,440px)] lg:gap-14 lg:py-0">
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
            className="max-w-xl"
          >
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-[var(--hb-blue)] uppercase">
              <Shield className="size-3.5" strokeWidth={2} />
              Secure admin access
            </p>
            <h1 className="mt-4 text-[2.15rem] leading-[1.12] font-semibold tracking-tight text-slate-900 sm:text-[2.75rem]">
              Manage your hosting
              <span className="mt-1 block text-slate-800">
                infrastructure with confidence
              </span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
              Open the HostingBeyond Orbit control panel to manage website
              content, pages, media, and site settings from one workspace.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:max-w-lg">
              {capabilities.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/55 px-3.5 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[var(--hb-blue)]/8 text-[var(--hb-blue)]">
                    <item.icon className="size-4" strokeWidth={1.8} />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : 0.06,
              ease: "easeOut",
            }}
          >
            <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-8">
              <div className="flex justify-center">
                <HostingBeyondLogo className="h-8 w-auto" />
              </div>

              <div className="mt-6 text-center">
                <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400 uppercase">
                  Orbit
                </p>
                <h2 className="mt-2 text-[1.7rem] leading-none font-semibold tracking-tight text-slate-900">
                  Super Admin
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Secure access to HostingBeyond infrastructure.
                </p>
              </div>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="orbit-access-key"
                    className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase"
                  >
                    Access key
                  </label>
                  <div className="relative mt-2">
                    <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="orbit-access-key"
                      type={showKey ? "text" : "password"}
                      name="orbit-access-key"
                      autoComplete="current-password"
                      value={accessKey}
                      onChange={(event) => setAccessKey(event.target.value)}
                      disabled={submitting}
                      aria-invalid={status === "error"}
                      aria-describedby={
                        status === "error" ? errorId : undefined
                      }
                      className="h-12 w-full rounded-full border border-slate-200 bg-slate-50/80 px-11 pr-12 text-sm text-slate-900 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 focus-visible:border-[var(--hb-blue)]/55 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/18 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Enter your Orbit access key"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((open) => !open)}
                      disabled={submitting}
                      className="absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 outline-none transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/35 disabled:opacity-50"
                      aria-label={
                        showKey ? "Hide access key" : "Show access key"
                      }
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
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--hb-blue)] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(47,107,255,0.28)] outline-none transition-[filter,transform,opacity] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--hb-blue)]/40 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <p className="text-red-600">{message}</p>
                ) : null}
                {status === "success" ? (
                  <p className="text-emerald-700">Opening Orbit…</p>
                ) : null}
              </div>

              <p className="mt-2 flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.14em] text-slate-400 uppercase">
                <Shield className="size-3.5" />
                Authorized personnel only
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
