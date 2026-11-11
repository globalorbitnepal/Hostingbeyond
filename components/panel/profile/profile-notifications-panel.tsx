"use client";

import { useState } from "react";

import { profileAction } from "@/components/panel/profile/profile-api";
import type {
  NotificationChannel,
  NotificationPrefs,
} from "@/lib/panel/customer-profile";

const ROWS: { key: keyof NotificationPrefs; title: string; hint: string }[] = [
  {
    key: "subscriptions",
    title: "Subscriptions and payments",
    hint: "Billing, renewals, and payment updates.",
  },
  {
    key: "security",
    title: "Account and its security",
    hint: "Sign-in, password, and security alerts.",
  },
  {
    key: "service",
    title: "Service status and changes",
    hint: "Downtime and changes that affect your services.",
  },
  {
    key: "offers",
    title: "Product updates and special offers",
    hint: "New products, updates, and discounts.",
  },
];

const CHANNELS: { id: NotificationChannel; label: string }[] = [
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
];

export function ProfileNotificationsPanel({
  initial,
}: {
  initial: NotificationPrefs;
}) {
  const [prefs, setPrefs] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);

  async function toggle(
    row: keyof NotificationPrefs,
    channel: NotificationChannel,
  ) {
    const next = {
      ...prefs,
      [row]: { ...prefs[row], [channel]: !prefs[row][channel] },
    };
    setPrefs(next);
    const result = await profileAction({
      action: "save-notifications",
      notifications: next,
    });
    setStatus(result.ok ? "Saved" : (result.error ?? "Could not save."));
  }

  return (
    <>
      <header>
        <p className="hb-eyebrow">Profile</p>
        <h1 className="hb-h1 mt-1">Notification settings</h1>
        <p className="hb-muted mt-2 max-w-2xl text-sm">
          Choose how HostingBeyond contacts you. Email is on for billing by
          default. You can turn any channel off at any time.
        </p>
      </header>
      {status ? <p className="hb-muted text-sm">{status}</p> : null}
      <section className="hb-profile-card overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr>
              <th className="px-5 py-3" />
              {CHANNELS.map((ch) => (
                <th
                  key={ch.id}
                  className="px-3 py-3 text-center text-xs font-extrabold"
                >
                  {ch.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.key}
                className="border-t border-[var(--hb-p-border)]"
              >
                <td className="px-5 py-4">
                  <p className="hb-text font-bold">{row.title}</p>
                  <p className="hb-muted mt-0.5 text-xs">{row.hint}</p>
                </td>
                {CHANNELS.map((ch) => (
                  <td key={ch.id} className="px-3 py-4 text-center">
                    <input
                      type="checkbox"
                      className="hb-profile-check"
                      checked={prefs[row.key][ch.id]}
                      onChange={() => void toggle(row.key, ch.id)}
                      aria-label={`${row.title} ${ch.label}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
