"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F6F8FC] px-5 py-10">
      <Link href="/" className="mb-8">
        <BrandMark />
      </Link>
      <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-6 shadow-[0_30px_80px_-28px_rgba(15,23,42,0.35)] sm:p-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-950">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the email on your HostingBeyond account. We will help you get
          back in.
        </p>
        {sent ? (
          <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            If an account exists for {email}, our team can restore access. Email
            hello@hostingbeyond.com or create a new session from Log in / Sign
            up.
          </p>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                Email address
              </span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 text-sm text-slate-900 focus:border-[var(--hb-blue)] focus:ring-4 focus:ring-[var(--hb-blue)]/12 focus:outline-none"
                  placeholder="you@email.com"
                />
              </span>
            </label>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--hb-blue)] to-[var(--hb-purple)] text-sm font-semibold text-white"
            >
              Continue
            </button>
          </form>
        )}
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--hb-blue)]"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
