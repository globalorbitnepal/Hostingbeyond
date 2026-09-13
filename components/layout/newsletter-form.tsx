"use client";

import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";

type Props = {
  placeholder: string;
  ctaLabel: string;
  privacy: string;
};

export function NewsletterForm({ placeholder, ctaLabel, privacy }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || "Please enter a valid email.");
        return;
      }
      setStatus("ok");
      setMessage("You’re subscribed. Watch your inbox for HostingBeyond news.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Could not subscribe right now. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="flex h-12 items-center gap-2 rounded-full border border-slate-200/90 bg-white pr-1.5 pl-4 shadow-[0_10px_24px_-16px_rgba(37,80,130,0.45)]"
      >
        <Mail className="size-4 shrink-0 text-slate-400" aria-hidden />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-4 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(79,70,229,0.28)] disabled:opacity-60"
        >
          {status === "saving" ? "…" : ctaLabel}
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </form>
      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <Lock className="size-3 text-slate-400" aria-hidden />
        {status === "ok" || status === "error" ? message : privacy}
      </p>
    </div>
  );
}
