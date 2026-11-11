"use client";

import { useState } from "react";
import { Check, Clock, FolderSync } from "lucide-react";

import { profileAction } from "@/components/panel/profile/profile-api";

export function ProfileAiMemoryPanel({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const result = await profileAction({
      action: "set-ai-memory",
      enabled: !on,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not update memory.");
      return;
    }
    setOn(!on);
  }

  return (
    <>
      <header>
        <p className="hb-eyebrow">Profile</p>
        <h1 className="hb-h1 mt-1">AI memory</h1>
        <p className="hb-muted mt-2 max-w-2xl text-sm">
          When memory is on, the HostingBeyond AI Agent can remember useful
          details from this account so it does not ask the same questions every
          time.
        </p>
      </header>
      <section className="hb-profile-card px-6 py-12 text-center">
        <p className="hb-text text-lg font-extrabold">
          {on
            ? "Memory is on for this account"
            : "Turn on memory for a personalized experience"}
        </p>
        <p className="hb-muted mx-auto mt-2 max-w-md text-sm">
          The agent keeps setup notes from chat, domains, and hosting — you can
          switch this off whenever you want.
        </p>
        <button
          type="button"
          className="hb-btn hb-btn-primary mx-auto mt-5"
          disabled={busy}
          onClick={() => void toggle()}
        >
          {on ? "Turn off memory" : "Turn on memory"}
        </button>
        {error ? (
          <p className="mt-3 text-sm text-[var(--hb-p-danger)]">{error}</p>
        ) : null}
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            icon: FolderSync,
            title: "Start projects faster",
            body: "The agent remembers where you left off.",
          },
          {
            icon: Check,
            title: "Help that fits your setup",
            body: "It keeps your domains, plans, and tools in context.",
          },
          {
            icon: Clock,
            title: "Continue where you left off",
            body: "Past chats carry over even when you come back later.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="hb-profile-card p-5">
              <Icon className="size-5 text-[var(--hb-p-primary)]" />
              <h3 className="hb-text mt-3 text-sm font-bold">{item.title}</h3>
              <p className="hb-muted mt-1 text-sm">{item.body}</p>
            </article>
          );
        })}
      </div>
    </>
  );
}
