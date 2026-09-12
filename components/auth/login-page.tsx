"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Headphones,
  Loader2,
  Lock,
  Mail,
  Shield,
  User,
  Zap,
} from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { CountryLanguageSelector } from "@/components/locale/country-language-selector";
import { cn } from "@/lib/utils";
import type { CmsLoginFeature, CmsLoginPage } from "@/lib/orbit/defaults";

const FEATURE_ICONS: Record<CmsLoginFeature["icon"], typeof Shield> = {
  shield: Shield,
  zap: Zap,
  headphones: Headphones,
  lock: Lock,
};

const ERROR_COPY: Record<string, string> = {
  oauth: "Social sign-in could not be completed. Try email instead.",
  oauth_denied: "Social sign-in was cancelled.",
  oauth_profile:
    "We could not read your social profile email. Try another method.",
  google_unavailable:
    "Google sign-in is not connected yet. Create an account with email, or ask support to enable Google.",
  github_unavailable:
    "GitHub sign-in is not connected yet. Create an account with email, or ask support to enable GitHub.",
  facebook_unavailable:
    "Facebook sign-in is not connected yet. Create an account with email, or ask support to enable Facebook.",
};

export function AuthPageView({
  content,
  mode,
}: {
  content: CmsLoginPage;
  mode: "login" | "signup";
}) {
  const reduceMotion = useReducedMotion();
  const messageId = useId();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "info">("info");

  const submitting = status === "loading";
  const features = (content.features ?? []).slice(0, 4);
  const backgroundImage =
    content.backgroundImage?.trim() || "/images/hero-atmosphere.jpg";
  const logoSrc = content.logoPath?.trim() || "/logo/hostingbeyond-logo-v5.png";
  const duration = reduceMotion ? 0 : 0.45;
  const delay = reduceMotion ? 0 : 0.08;
  const isSignup = mode === "signup";

  const fieldClass = cn(
    "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 text-sm text-slate-900",
    "placeholder:text-slate-400",
    "transition-[border-color,box-shadow] duration-200",
    "focus:border-[var(--hb-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--hb-blue)]/12",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "motion-reduce:transition-none",
  );

  const oauthMessage = useMemo(() => {
    if (!oauthError) return "";
    return ERROR_COPY[oauthError] || ERROR_COPY.oauth;
  }, [oauthError]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setMessage("");

    if (isSignup && password !== confirmPassword) {
      setMessageTone("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(
        isSignup ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isSignup
              ? { name, email, password }
              : { email, password, remember },
          ),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessageTone("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      window.location.assign("/account");
    } catch {
      setMessageTone("error");
      setMessage("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#F6F8FC] text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0.96) 0%, rgba(248,250,255,0.9) 40%, rgba(241,245,255,0.46) 66%, rgba(15,23,42,0.2) 100%), url('${backgroundImage}')`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_42%,rgba(47,107,255,0.16),transparent_44%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hb-blue)]"
          >
            <BrandMark src={logoSrc} />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <CountryLanguageSelector compact variant="globe" tone="light" />
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to website</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,480px)] lg:gap-12 lg:py-10 xl:gap-16">
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 max-w-xl lg:order-1"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase shadow-sm">
              <Shield className="h-3.5 w-3.5 text-[var(--hb-blue)]" />
              {content.badge || "Client control panel"}
            </p>
            <h1 className="font-heading mt-6 text-[2.4rem] leading-[1.05] font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.85rem]">
              {isSignup
                ? "Create your HostingBeyond account"
                : content.headline}
              {isSignup ? (
                <span className="mt-1 block bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] bg-clip-text text-transparent">
                  in a minute
                </span>
              ) : content.headlineAccent ? (
                <span className="mt-1 block bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] bg-clip-text text-transparent">
                  {content.headlineAccent}
                </span>
              ) : null}
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-600 sm:text-base">
              {isSignup
                ? "Sign up with email or continue with Google, GitHub or Facebook — then manage hosting from one place."
                : content.description}
            </p>

            <ul className="mt-8 hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon] ?? Shield;
                return (
                  <li
                    key={feature.id || feature.title}
                    className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3.5 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-sm"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[var(--hb-blue)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {feature.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                        {feature.description}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.section>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 w-full lg:order-2 lg:justify-self-end"
          >
            <div className="w-full rounded-[28px] border border-white/90 bg-white p-6 shadow-[0_30px_80px_-28px_rgba(15,23,42,0.35),0_12px_32px_-18px_rgba(47,107,255,0.18)] sm:p-8">
              <div className="mb-7 text-center">
                <div className="mb-5 flex justify-center">
                  <BrandMark src={logoSrc} className="h-9 sm:h-10" />
                </div>
                <h2 className="font-heading text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-950">
                  {isSignup ? "Create an account" : content.cardTitle}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  {isSignup
                    ? "Use email or a social account. One click signs you in if you already have an account."
                    : content.cardSubtitle}
                </p>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                {isSignup ? (
                  <label className="block" htmlFor="customer-name">
                    <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Full name
                    </span>
                    <span className="relative block">
                      <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="customer-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        className={fieldClass}
                        disabled={submitting}
                      />
                    </span>
                  </label>
                ) : null}

                <label className="block" htmlFor="customer-email">
                  <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                    {content.emailLabel}
                  </span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="customer-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={content.emailPlaceholder}
                      className={fieldClass}
                      disabled={submitting}
                    />
                  </span>
                </label>

                <label className="block" htmlFor="customer-password">
                  <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                    {content.passwordLabel}
                  </span>
                  <span className="relative block">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="customer-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete={
                        isSignup ? "new-password" : "current-password"
                      }
                      required
                      minLength={isSignup ? 8 : 1}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={
                        isSignup
                          ? "At least 8 characters"
                          : content.passwordPlaceholder
                      }
                      className={cn(fieldClass, "pr-12")}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute top-1/2 right-2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </span>
                </label>

                {isSignup ? (
                  <label className="block" htmlFor="customer-confirm">
                    <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                      Confirm password
                    </span>
                    <span className="relative block">
                      <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="customer-confirm"
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Repeat your password"
                        className={fieldClass}
                        disabled={submitting}
                      />
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(event) => setRemember(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[var(--hb-blue)] focus:ring-[var(--hb-blue)]"
                      />
                      {content.rememberLabel}
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold text-[var(--hb-blue)] hover:text-[#1D4ED8]"
                    >
                      {content.forgotLabel}
                    </Link>
                  </div>
                )}

                {oauthMessage || message ? (
                  <p
                    id={messageId}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm",
                      messageTone === "error" || oauthMessage
                        ? "border-red-100 bg-red-50 text-red-800"
                        : "border-blue-100 bg-blue-50 text-blue-800",
                    )}
                    role="status"
                  >
                    {message || oauthMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] text-sm font-semibold text-white shadow-[0_12px_24px_-10px_rgba(47,107,255,0.7)] transition hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {submitting
                    ? isSignup
                      ? "Creating account…"
                      : "Signing in…"
                    : isSignup
                      ? "Create account"
                      : content.loginCtaLabel}
                  {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </form>

              <SocialAuthButtons dividerLabel={content.dividerLabel} />

              <p className="mt-6 text-center text-sm text-slate-500">
                {isSignup ? "Already have an account?" : content.signupPrompt}{" "}
                <Link
                  href={isSignup ? "/login" : "/signup"}
                  className="font-semibold text-[var(--hb-blue)] hover:text-[#1D4ED8]"
                >
                  {isSignup ? "Log in" : content.signupLabel}
                </Link>
              </p>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Shield className="h-3.5 w-3.5" />
                Secure account access
              </p>
            </div>
          </motion.section>
        </div>

        <p className="pb-2 text-center text-[11px] text-slate-400 lg:text-left">
          {content.copyright}
        </p>
      </div>
    </div>
  );
}

export { AuthPageView as LoginPageView };
