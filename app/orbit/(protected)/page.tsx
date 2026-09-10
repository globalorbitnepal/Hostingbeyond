"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  ImageIcon,
  Navigation,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

type DashboardData = {
  admin: { displayName: string };
  stats: { credentials: number; media: number; pages: number };
  recentActivity: Array<{
    id: string;
    action: string;
    resource: string | null;
    createdAt: string;
  }>;
};

const cmsAreas = [
  {
    href: "/orbit/content",
    label: "Website content",
    detail: "Hero, hosting types, plans, partners, and login page copy",
    icon: Sparkles,
  },
  {
    href: "/orbit/pages",
    label: "Pages",
    detail: "Public pages, titles, visibility, and previews",
    icon: FileText,
  },
  {
    href: "/orbit/media",
    label: "Images & media",
    detail: "Upload, replace, preview, and organize assets",
    icon: ImageIcon,
  },
  {
    href: "/orbit/navigation",
    label: "Navigation",
    detail: "Header and site navigation content",
    icon: Navigation,
  },
  {
    href: "/orbit/seo",
    label: "SEO",
    detail: "Meta titles, descriptions, and Open Graph defaults",
    icon: Search,
  },
  {
    href: "/orbit/settings",
    label: "Site settings",
    detail: "Brand, contact, and CTA defaults",
    icon: Settings,
  },
] as const;

export default function OrbitDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/me");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load dashboard");
        return;
      }
      setData(json);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Control the HostingBeyond website from one Orbit workspace.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Website status",
            value: "Online",
            href: "/",
            external: true,
          },
          {
            label: "Pages",
            value: String(data?.stats.pages ?? "—"),
            href: "/orbit/pages",
          },
          {
            label: "Media assets",
            value: String(data?.stats.media ?? "—"),
            href: "/orbit/media",
          },
          {
            label: "Activity",
            value: String(data?.recentActivity.length ?? "—"),
            href: "/orbit/activity",
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            {...(card.external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[var(--hb-blue)]/40"
          >
            <p className="text-xs tracking-wide text-slate-500 uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-900">Website CMS</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cmsAreas.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[var(--hb-blue)]/35"
            >
              <area.icon className="size-5 text-[var(--hb-blue)]" />
              <p className="mt-3 text-sm font-semibold">{area.label}</p>
              <p className="mt-1 text-sm text-slate-500">{area.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-slate-400" />
          <h2 className="text-sm font-semibold">Recent activity</h2>
        </div>
        <ul className="mt-4 space-y-3">
          {(data?.recentActivity ?? []).length === 0 ? (
            <li className="text-sm text-slate-500">No activity yet.</li>
          ) : (
            data?.recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-slate-800">{item.action}</span>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
