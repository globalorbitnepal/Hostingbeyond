"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";

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
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <header>
        <p className="hb-eyebrow">Support</p>
        <h1 className="hb-h1 mt-1">Open a support request</h1>
        <p className="hb-muted mt-1 text-sm">
          Replies go to {email}. For domain DNS changes, use the DNS tab on the
          domain page — those apply immediately.
        </p>
      </header>

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="hb-panel-card space-y-4 p-5"
      >
        <label className="block">
          <span className="hb-label">Topic</span>
          <select
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value as (typeof TOPICS)[number])
            }
            className="hb-select h-11"
          >
            {TOPICS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="hb-label">Message</span>
          <textarea
            required
            minLength={10}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="hb-textarea min-h-32"
            placeholder="Include the domain or order reference and what you need."
          />
        </label>
        {error ? (
          <p className="hb-pill hb-pill-danger inline-flex">
            <AlertTriangle className="size-3.5" />
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="hb-pill hb-pill-ok inline-flex">
            <CheckCircle2 className="size-3.5" />
            {status}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className="hb-btn hb-btn-primary">
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {busy ? "Sending" : "Send request"}
        </button>
      </form>
    </div>
  );
}
