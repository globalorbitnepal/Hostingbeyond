"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

type Props = {
  onAuthenticated: () => void;
  className?: string;
};

export function CheckoutAuthPanel({ onAuthenticated, className }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setMessage("");
    setStatus("loading");
    try {
      const res = await fetch(
        mode === "signup" ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            mode === "signup"
              ? { name, email, password }
              : { email, password, remember },
          ),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      onAuthenticated();
    } catch {
      setMessage("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div
      className={cn(
        "rounded-[20px] border border-violet-200/70 bg-gradient-to-br from-[#f8f4ff] to-white p-5 sm:p-6",
        className,
      )}
      role="region"
      aria-labelledby="checkout-auth-title"
    >
      <h2
        id="checkout-auth-title"
        className="text-[16px] font-extrabold text-[#1a1035]"
      >
        Sign in to continue
      </h2>
      <p className="mt-1 text-[13px] text-slate-600">
        Your domains cart is saved. Sign in or create an account to complete
        registration — you&apos;ll stay on this checkout page.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={cn(
            "min-h-11 flex-1 rounded-full text-[13px] font-bold",
            mode === "login"
              ? "bg-[#673de6] text-white"
              : "border border-slate-200 bg-white text-slate-600",
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={cn(
            "min-h-11 flex-1 rounded-full text-[13px] font-bold",
            mode === "signup"
              ? "bg-[#673de6] text-white"
              : "border border-slate-200 bg-white text-slate-600",
          )}
        >
          Create account
        </button>
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        {mode === "signup" ? (
          <label className="block">
            <span className="text-[12px] font-bold text-slate-500 uppercase">
              Name
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 flex min-h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px]"
              autoComplete="name"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-[12px] font-bold text-slate-500 uppercase">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 flex min-h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px]"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-bold text-slate-500 uppercase">
            Password
          </span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 flex min-h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px]"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
          />
        </label>
        {message ? (
          <p className="text-[13px] font-medium text-red-700" role="alert">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#673de6] to-[#2563eb] text-[14px] font-bold text-white disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {mode === "signup"
            ? "Create account & continue"
            : "Sign in & continue"}
        </button>
      </form>
      <p className="mt-3 text-center text-[12px] text-slate-500">
        Prefer the full sign-in page?{" "}
        <Link
          href={`${routes.login}?next=${encodeURIComponent(routes.domainCheckout)}`}
          className="font-semibold text-[#673de6] hover:underline"
        >
          Open login
        </Link>
      </p>
    </div>
  );
}
