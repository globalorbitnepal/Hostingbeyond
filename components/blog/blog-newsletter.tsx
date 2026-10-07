"use client";

import { useState } from "react";

export function BlogNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Could not subscribe.");
        return;
      }
      setStatus("ok");
      setMessage("Thanks — you're subscribed.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#1a1035]">
        Get practical hosting and website tips
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Product updates and guides from HostingBeyond. No spam.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="h-11 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:ring-2 focus:ring-[#673de6]/30"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-11 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          Subscribe
        </button>
      </form>
      {message ? (
        <p
          className={`mt-2 text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
