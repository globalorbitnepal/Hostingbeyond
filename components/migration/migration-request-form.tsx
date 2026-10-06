"use client";

import { type FormEvent, useState } from "react";

export function MigrationRequestForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/migration/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        error?: string;
        message?: string;
        requestId?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Could not submit request.");
        return;
      }
      setSuccess(
        json.message ??
          `Request ${json.requestId ?? ""} received. We will email you shortly.`,
      );
      event.currentTarget.reset();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hb-home-section bg-white py-16">
      <div className="hb-shell max-w-2xl">
        <h2 className="font-heading text-2xl font-extrabold text-[#2f1c6a]">
          Request a migration
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Tell us about your site — our team will review and schedule your move.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            name="customerName"
            required
            placeholder="Your name"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            name="customerEmail"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            name="customerPhone"
            placeholder="Phone (optional)"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            name="websiteUrl"
            type="url"
            placeholder="Current website URL"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            name="domain"
            placeholder="Domain name"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          <select
            name="websiteType"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            defaultValue=""
          >
            <option value="" disabled>
              Website type
            </option>
            <option value="wordpress">WordPress</option>
            <option value="laravel">Laravel</option>
            <option value="nodejs">Node.js</option>
            <option value="php">PHP</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="notes"
            rows={4}
            placeholder="Notes — hosting provider, email accounts, timing…"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          />
          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center rounded-full bg-[#673de6] px-8 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? "Sending…" : "Submit migration request"}
          </button>
        </form>
      </div>
    </section>
  );
}
