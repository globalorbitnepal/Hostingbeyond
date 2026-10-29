"use client";

import { useState } from "react";

import { CONTACT_TOPICS } from "@/lib/orbit/contact-page-content";

const fieldClass =
  "mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#1a1035] caret-[#1a1035] outline-none placeholder:text-slate-400 focus:border-[#673de6]/50 focus:ring-2 focus:ring-[#673de6]/25";

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
        <label className="block text-sm" htmlFor="contact-name">
          <span className="font-semibold text-slate-700">Name *</span>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm" htmlFor="contact-email">
          <span className="font-semibold text-slate-700">Email *</span>
          <input
            id="contact-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </label>
        <label
          className="block text-sm sm:col-span-2"
          htmlFor="contact-company"
        >
          <span className="font-semibold text-slate-700">
            Company (optional)
          </span>
          <input
            id="contact-company"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm sm:col-span-2" htmlFor="contact-topic">
          <span className="font-semibold text-slate-700">Topic *</span>
          <select
            id="contact-topic"
            name="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={fieldClass}
          >
            {CONTACT_TOPICS.map((t) => (
              <option key={t} value={t} className="bg-white text-[#1a1035]">
                {t}
              </option>
            ))}
          </select>
        </label>
        <label
          className="block text-sm sm:col-span-2"
          htmlFor="contact-message"
        >
          <span className="font-semibold text-slate-700">Message *</span>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            className={`${fieldClass} h-auto min-h-[9rem] py-2.5`}
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
