"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { profileAction } from "@/components/panel/profile/profile-api";

export type ProfileSessionRow = {
  id: string;
  current: boolean;
  device: string;
  location: string;
  createdAt: string | Date;
  loginType: string;
};

export function ProfileActivityPanel({
  sessions,
}: {
  sessions: ProfileSessionRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (row) =>
        row.location.toLowerCase().includes(q) ||
        row.device.toLowerCase().includes(q) ||
        row.loginType.toLowerCase().includes(q),
    );
  }, [query, sessions]);

  return (
    <>
      <header>
        <p className="hb-eyebrow">Profile</p>
        <h1 className="hb-h1 mt-1">Account activity</h1>
      </header>
      <section className="hb-profile-card p-5">
        <p className="hb-muted text-sm">
          You can sign out any other device that has connected to this account.
        </p>
      </section>
      <section className="hb-profile-card overflow-x-auto">
        <div className="p-4">
          <input
            className="hb-input"
            placeholder="Search by location or device"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="hb-muted text-xs">
              <th className="px-4 py-2 font-bold">Current login</th>
              <th className="px-4 py-2 font-bold">Device</th>
              <th className="px-4 py-2 font-bold">Location</th>
              <th className="px-4 py-2 font-bold">First login</th>
              <th className="px-4 py-2 font-bold">Login type</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--hb-p-border)]">
                <td className="hb-text px-4 py-3 font-semibold">
                  {new Date(row.createdAt).toLocaleString()}
                  {row.current ? (
                    <span className="hb-pill hb-pill-ok ml-2">This device</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 capitalize">{row.device}</td>
                <td className="px-4 py-3">{row.location}</td>
                <td className="px-4 py-3">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">{row.loginType}</td>
                <td className="px-4 py-3">
                  {row.current ? null : (
                    <button
                      type="button"
                      className="hb-btn hb-btn-ghost hb-btn-sm"
                      onClick={async () => {
                        const result = await profileAction({
                          action: "revoke-session",
                          sessionId: row.id,
                        });
                        if (!result.ok)
                          setError(result.error ?? "Could not sign out.");
                        else router.refresh();
                      }}
                    >
                      Sign out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="hb-muted px-4 py-8 text-center text-sm">
            No sessions match.
          </p>
        ) : null}
        {error ? (
          <p className="px-4 pb-4 text-sm text-[var(--hb-p-danger)]">{error}</p>
        ) : null}
      </section>
    </>
  );
}
