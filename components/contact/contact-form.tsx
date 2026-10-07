"use client";

import { useState } from "react";

import { CONTACT_TOPICS } from "@/lib/orbit/contact-page-content";

export function ContactForm({
  formTitle,
  formDescription,
  successTitle,
  successMessage,
}: {
  formTitle: string;
  formDescription: string;
  successTitle: string;
  successMessage: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState<string>(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, company, topic, message }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(json.error || "Could not send message.");
        return;
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <div
        id="contact-form"
        className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="text-xl font-extrabold text-[#1a1035]">
          {successTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {successMessage}
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-[#673de6]"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      id="contact-form"
      onSubmit={onSubmit}
      className="rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_8px_40px_rgba(103,61,230,0.08)] sm:p-8"
    >
      <h2 className="text-xl font-extrabold text-[#1a1035]">{formTitle}</h2>
      <p className="mt-2 text-sm text-slate-600">{formDescription}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Name *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#673de6]/30"
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Email *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#673de6]/30"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-semibold text-slate-700">
            Company (optional)
          </span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#673de6]/30"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-semibold text-slate-700">Topic *</span>
          <select
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#673de6]/30"
          >
            {CONTACT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-semibold text-slate-700">Message *</span>
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#673de6]/30"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#673de6] px-8 text-sm font-bold text-white hover:bg-[#5b32d6] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
