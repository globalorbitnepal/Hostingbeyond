"use client";

import { useState } from "react";

const TOPICS = [
  "Technical support",
  "Billing & invoices",
  "Domain services",
  "Migration help",
] as const;

export function PanelSupportForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [topic, setTopic] =
    useState<(typeof TOPICS)[number]>("Technical support");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || email.split("@")[0],
          email,
          topic,
          message,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not send this request.");
        return;
      }
      setMessage("");
      setStatus("Request received. We will reply to your account email.");
    } catch {
      setError("Could not send this request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="hb-panel-card space-y-4 p-6"
      >
        <div>
          <h2 className="font-heading text-xl font-bold">Support</h2>
          <p className="mt-1 text-sm text-[var(--hb-p-muted)]">
            This opens a real request on your account email. Domain DNS changes
            stay on My Domains → the domain → Nameservers.
          </p>
        </div>
        <label className="block text-sm">
          <span className="font-semibold">Topic</span>
          <select
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value as (typeof TOPICS)[number])
            }
            className="mt-1 h-11 w-full rounded-xl border border-[var(--hb-p-border)] bg-transparent px-3"
          >
            {TOPICS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Message</span>
          <textarea
            required
            minLength={10}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-1 min-h-32 w-full rounded-xl border border-[var(--hb-p-border)] bg-transparent px-3 py-2"
            placeholder="Domain, hosting order, and what you need."
          />
        </label>
        {error ? <p className="text-sm text-amber-700">{error}</p> : null}
        {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: "#5b21b6" }}
        >
          {busy ? "Sending" : "Send request"}
        </button>
      </form>
    </div>
  );
}
