"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { profileAction } from "@/components/panel/profile/profile-api";
import type { ProfileShare } from "@/lib/panel/customer-profile";

export function ProfileSharingPanel({ shares }: { shares: ProfileShare[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"request" | "give">("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = shares.filter((row) => row.direction === tab);

  async function submit() {
    setBusy(true);
    setError(null);
    const result = await profileAction({
      action: "share",
      direction: tab,
      email,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not send.");
      return;
    }
    setEmail("");
    router.refresh();
  }

  return (
    <>
      <header>
        <p className="hb-eyebrow">Profile</p>
        <h1 className="hb-h1 mt-1">Account sharing</h1>
      </header>
      <section className="hb-profile-card p-5">
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            className={
              tab === "request"
                ? "hb-btn hb-btn-primary"
                : "hb-btn hb-btn-ghost"
            }
            onClick={() => setTab("request")}
          >
            Request access
          </button>
          <button
            type="button"
            className={
              tab === "give" ? "hb-btn hb-btn-primary" : "hb-btn hb-btn-ghost"
            }
            onClick={() => setTab("give")}
          >
            Give access
          </button>
        </div>
        <p className="hb-muted text-sm">
          {tab === "request"
            ? "Ask to manage another HostingBeyond account. We email that address a request."
            : "Let another HostingBeyond login manage this account."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            className="hb-input max-w-sm"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="button"
            className="hb-btn hb-btn-primary"
            disabled={busy}
            onClick={() => void submit()}
          >
            {tab === "request" ? "Request access" : "Give access"}
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-[var(--hb-p-danger)]">{error}</p>
        ) : null}
      </section>
      <section className="hb-profile-card">
        {rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="hb-text text-sm font-bold">Nothing found</p>
            <p className="hb-muted mt-1 text-sm">No shared accounts yet.</p>
          </div>
        ) : (
          <ul>
            {rows.map((row) => (
              <li key={row.id} className="hb-profile-row">
                <p className="hb-profile-row__label">{row.email}</p>
                <p className="hb-muted text-sm capitalize">{row.status}</p>
                <button
                  type="button"
                  className="hb-btn hb-btn-ghost hb-btn-sm"
                  onClick={async () => {
                    await profileAction({ action: "share-revoke", id: row.id });
                    router.refresh();
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
