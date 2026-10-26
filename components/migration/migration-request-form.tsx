"use client";

import { type FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] text-[#1a1035] outline-none transition focus:border-[#673de6] focus:ring-4 focus:ring-[#673de6]/10";

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
          `Request ${json.requestId ?? ""} received. Our team will review it and email you — your site is not moved automatically.`,
      );
      event.currentTarget.reset();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="migration-request"
      className="hb-home-section scroll-mt-24 bg-white py-16 sm:py-20"
      aria-labelledby="migration-request-heading"
    >
      <div className="hb-shell max-w-2xl">
        <h2
          id="migration-request-heading"
          className="font-heading text-2xl font-extrabold text-[#2f1c6a] sm:text-3xl"
        >
          Request a migration
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          Tell us about your site. This form creates a{" "}
          <strong className="font-semibold text-[#1e1b4b]">
            migration request
          </strong>{" "}
          for our team — it does not transfer your domain at the registrar or
          move files automatically.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="migration-customer-name" className="sr-only">
              Your name
            </label>
            <input
              id="migration-customer-name"
              name="customerName"
              required
              minLength={2}
              autoComplete="name"
              placeholder="Your name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="migration-customer-email" className="sr-only">
              Email
            </label>
            <input
              id="migration-customer-email"
              name="customerEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="migration-customer-phone" className="sr-only">
              Phone (optional)
            </label>
            <input
              id="migration-customer-phone"
              name="customerPhone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone (optional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="migration-website-url" className="sr-only">
              Current website URL
            </label>
            <input
              id="migration-website-url"
              name="websiteUrl"
              type="url"
              inputMode="url"
              placeholder="Current website URL (https://…)"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="migration-domain" className="sr-only">
              Domain name
            </label>
            <input
              id="migration-domain"
              name="domain"
              autoComplete="off"
              placeholder="Primary domain name"
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="migration-website-type"
              className="text-[12px] font-bold tracking-wide text-slate-500 uppercase"
            >
              Website type
            </label>
            <select
              id="migration-website-type"
              name="websiteType"
              className={cn(fieldClass, "mt-1.5")}
              defaultValue=""
            >
              <option value="">Select type (optional)</option>
              <option value="wordpress">WordPress</option>
              <option value="laravel">Laravel</option>
              <option value="nodejs">Node.js</option>
              <option value="php">PHP</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="migration-notes" className="sr-only">
              Notes
            </label>
            <textarea
              id="migration-notes"
              name="notes"
              rows={4}
              placeholder="Notes — current host, email accounts, preferred timing…"
              className={fieldClass}
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
            >
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#673de6] px-8 text-sm font-bold text-white transition hover:bg-[#5c35d4] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              "Submit migration request"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
