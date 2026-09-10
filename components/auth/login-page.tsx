"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
  Rocket,
  Shield,
  Zap,
} from "lucide-react";

import { CountryLanguageSelector } from "@/components/locale/country-language-selector";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import type { CmsLoginFeature, CmsLoginPage } from "@/lib/orbit/defaults";

function FeatureIcon({
  icon,
  className,
}: {
  icon: CmsLoginFeature["icon"];
  className?: string;
}) {
  if (icon === "zap") return <Zap className={className} aria-hidden />;
  if (icon === "headphones")
    return <Headphones className={className} aria-hidden />;
  if (icon === "lock") return <Lock className={className} aria-hidden />;
  return <Shield className={className} aria-hidden />;
}

const featureAccent: Record<
  CmsLoginFeature["icon"],
  { wrap: string; icon: string }
> = {
  shield: {
    wrap: "border-[#3b82f6]/50 bg-[#3b82f6]/15 shadow-[0_0_18px_rgba(59,130,246,0.25)]",
    icon: "text-[#60a5fa]",
  },
  zap: {
    wrap: "border-[#a855f7]/50 bg-[#a855f7]/15 shadow-[0_0_18px_rgba(168,85,247,0.25)]",
    icon: "text-[#c084fc]",
  },
  headphones: {
    wrap: "border-[#22d3ee]/50 bg-[#22d3ee]/15 shadow-[0_0_18px_rgba(34,211,238,0.22)]",
    icon: "text-[#67e8f9]",
  },
  lock: {
    wrap: "border-[#e879f9]/50 bg-[#e879f9]/15 shadow-[0_0_18px_rgba(232,121,249,0.22)]",
    icon: "text-[#f0abfc]",
  },
};

/** Official multicolor Google G */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.1.73-.24.73-.53v-1.85c-3 .65-3.63-1.45-3.63-1.45-.49-1.25-1.2-1.58-1.2-1.58-.98-.67.07-.66.07-.66 1.09.08 1.66 1.12 1.66 1.12.96 1.65 2.52 1.17 3.13.9.1-.7.38-1.17.69-1.44-2.4-.27-4.92-1.2-4.92-5.34 0-1.18.42-2.14 1.11-2.9-.11-.27-.48-1.37.11-2.85 0 0 .91-.29 2.97 1.11a10.3 10.3 0 0 1 5.42 0c2.06-1.4 2.97-1.11 2.97-1.11.59 1.48.22 2.58.11 2.85.69.76 1.11 1.72 1.11 2.9 0 4.15-2.53 5.07-4.94 5.34.39.33.73.99.73 2v2.97c0 .29.18.63.74.52A11 11 0 0 0 12 1.27z" />
    </svg>
  );
}

export function LoginPageView({ content }: { content: CmsLoginPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("Login will connect to your account system soon.");
  }

  const customBg =
    content.backgroundImage &&
    content.backgroundImage !== "/images/login-bg.jpg"
      ? content.backgroundImage
      : "";

  return (
    <div className="relative h-svh max-h-svh overflow-hidden bg-[#0a1628] text-white">
      {/* CSS atmosphere only — no pasted mockup image */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(186,230,253,0.14),transparent_50%),radial-gradient(ellipse_at_85%_30%,rgba(96,165,250,0.26),transparent_45%),radial-gradient(ellipse_at_75%_75%,rgba(147,197,253,0.16),transparent_50%)]" />
        <div className="absolute top-[-10%] right-[-5%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(125,211,252,0.2),transparent_68%)] blur-3xl" />
        <div className="absolute right-[5%] bottom-[-15%] h-[55%] w-[45%] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.18),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 py-3 sm:px-8 lg:px-10 lg:py-4">
        <header className="flex shrink-0 items-center justify-between gap-4">
          <Logo
            src={content.logoPath || "/logo/hostingbeyond-logo-transparent.png"}
            className="w-[230px] max-w-[230px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:w-[264px] sm:max-w-[264px]"
          />
          <CountryLanguageSelector variant="globe" />
        </header>

        <div className="grid min-h-0 flex-1 items-center gap-6 py-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,430px)] lg:gap-10">
          <div className="max-w-[620px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#a855f7]/40 bg-[#12082a]/55 px-3.5 py-1.5 text-[11px] font-extrabold text-white shadow-[0_0_24px_rgba(168,85,247,0.18)] backdrop-blur-xl">
              <Rocket className="size-3.5 text-[#c084fc]" aria-hidden />
              {content.badge}
            </span>

            <h1 className="font-heading mt-4 text-[clamp(1.85rem,3.6vw,2.85rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
              {content.headline}{" "}
              <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c026d3] bg-clip-text text-transparent">
                {content.headlineAccent}
              </span>
              .
            </h1>

            <p className="mt-3 max-w-[500px] text-[14px] leading-relaxed font-bold text-white/80 sm:text-[15px]">
              {content.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {content.features.map((feature) => {
                const accent =
                  featureAccent[feature.icon] ?? featureAccent.shield;
                return (
                  <div key={feature.id} className="min-w-0">
                    <span
                      className={cn(
                        "inline-flex size-10 items-center justify-center rounded-2xl border backdrop-blur-md",
                        accent.wrap,
                      )}
                    >
                      <FeatureIcon
                        icon={feature.icon}
                        className={cn("size-5", accent.icon)}
                      />
                    </span>
                    <h3 className="mt-2 text-[12px] font-extrabold tracking-tight text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-snug font-semibold text-white/65">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dark cream-blue glass login card */}
          <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-end">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[36px] bg-[radial-gradient(ellipse,rgba(125,211,252,0.22),transparent_65%)] blur-2xl"
            />
            <div className="hb-login-glass relative overflow-hidden rounded-[24px] p-px shadow-[0_20px_60px_rgba(5,16,36,0.55)]">
              <div className="rounded-[23px] border border-sky-200/15 bg-[linear-gradient(165deg,rgba(12,28,52,0.82),rgba(10,24,46,0.78)_50%,rgba(8,22,42,0.84))] p-5 shadow-[inset_0_1px_0_rgba(186,230,253,0.12)] backdrop-blur-2xl sm:p-6">
                <h2 className="text-[24px] font-extrabold tracking-tight text-white">
                  {content.cardTitle}
                </h2>
                <p className="mt-1.5 text-[12px] leading-snug font-bold text-white/70">
                  {content.cardSubtitle}
                </p>

                {(content.google.visible || content.github.visible) && (
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {content.google.visible ? (
                      <a
                        href={content.google.href || "#"}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/[0.06] px-2.5 text-[11.5px] font-extrabold whitespace-nowrap text-white backdrop-blur-md transition hover:bg-white/[0.1]"
                      >
                        <GoogleMark className="size-4 shrink-0" />
                        <span>{content.google.label}</span>
                      </a>
                    ) : null}
                    {content.github.visible ? (
                      <a
                        href={content.github.href || "#"}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/[0.06] px-2.5 text-[11.5px] font-extrabold whitespace-nowrap text-white backdrop-blur-md transition hover:bg-white/[0.1]"
                      >
                        <GitHubMark className="size-4 shrink-0 text-white" />
                        <span>{content.github.label}</span>
                      </a>
                    ) : null}
                  </div>
                )}

                {(content.google.visible || content.github.visible) && (
                  <div className="my-3.5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/12" />
                    <span className="text-[10px] font-extrabold tracking-[0.16em] text-white/50 uppercase">
                      {content.dividerLabel}
                    </span>
                    <span className="h-px flex-1 bg-white/12" />
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-3">
                  <label className="block">
                    <span className="text-[11px] font-extrabold text-white/85">
                      {content.emailLabel}
                    </span>
                    <span className="mt-1 flex items-center gap-2.5 rounded-xl border border-white/12 bg-black/35 px-3 backdrop-blur-md focus-within:border-sky-400/45">
                      <Mail
                        className="size-4 shrink-0 text-white/50"
                        aria-hidden
                      />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={content.emailPlaceholder}
                        className="min-w-0 flex-1 bg-transparent py-2.5 text-[13px] font-bold text-white outline-none placeholder:font-semibold placeholder:text-white/35"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-extrabold text-white/85">
                      {content.passwordLabel}
                    </span>
                    <span className="mt-1 flex items-center gap-2.5 rounded-xl border border-white/12 bg-black/35 px-3 backdrop-blur-md focus-within:border-sky-400/45">
                      <Lock
                        className="size-4 shrink-0 text-white/50"
                        aria-hidden
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={content.passwordPlaceholder}
                        className="min-w-0 flex-1 bg-transparent py-2.5 text-[13px] font-bold text-white outline-none placeholder:font-semibold placeholder:text-white/35"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="shrink-0 text-white/50 transition hover:text-white"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-extrabold text-white/80">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="size-3.5 rounded border-white/25 bg-black/40 text-[#38bdf8]"
                      />
                      {content.rememberLabel}
                    </label>
                    <Link
                      href={content.forgotHref || "#"}
                      className="text-[12px] font-extrabold text-sky-300 transition hover:text-sky-200"
                    >
                      {content.forgotLabel}
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#38bdf8] via-[#3b82f6] to-[#7c3aed] text-[14px] font-extrabold text-white shadow-[0_10px_28px_rgba(56,189,248,0.32)] transition hover:brightness-110"
                  >
                    {content.loginCtaLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </button>

                  {message ? (
                    <p className="text-center text-[12px] font-bold text-amber-200/90">
                      {message}
                    </p>
                  ) : null}
                </form>

                <p className="mt-3.5 text-center text-[12px] font-bold text-white/70">
                  {content.signupPrompt}{" "}
                  <Link
                    href={content.signupHref || "/get-started"}
                    className="font-extrabold text-sky-300 transition hover:text-sky-200"
                  >
                    {content.signupLabel}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="shrink-0 pt-1 pb-1 text-[11px] font-bold text-white/40">
          {content.copyright}
        </p>
      </div>
    </div>
  );
}
