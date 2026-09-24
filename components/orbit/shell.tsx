"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  FileText,
  Globe,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Navigation,
  Search,
  Settings,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import { useState } from "react";

import { HostingBeyondLogo } from "@/components/shared/hostingbeyond-logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/orbit", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orbit/pages", label: "Pages", icon: FileText },
  { href: "/orbit/content", label: "Website Content", icon: Sparkles },
  { href: "/orbit/domains", label: "Domain Pages", icon: Globe },
  { href: "/orbit/pricing", label: "Pricing Page", icon: Tags },
  { href: "/orbit/beyond-ai", label: "Beyond AI Product", icon: Sparkles },
  { href: "/orbit/navigation", label: "Navigation", icon: Navigation },
  { href: "/orbit/media", label: "Media Library", icon: ImageIcon },
  { href: "/orbit/seo", label: "SEO", icon: Search },
  { href: "/orbit/forms", label: "Forms", icon: FileText },
  { href: "/orbit/activity", label: "Activity Log", icon: Activity },
  { href: "/orbit/settings", label: "Settings", icon: Settings },
] as const;

export function OrbitShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/orbit/auth/logout", { method: "POST" });
    router.replace("/orbit");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#e8eeff] text-slate-900">
      <div className="mx-auto flex min-h-dvh max-w-[1600px]">
        <aside
          className={cn(
            "hb-band-purple fixed inset-y-0 left-0 z-40 w-72 border-r border-white/15 p-4 text-white transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-8 flex items-center justify-between px-2">
            <div>
              <HostingBeyondLogo className="h-7 w-auto" />
              <p className="mt-2 text-[10px] font-semibold tracking-[0.22em] text-white/55 uppercase">
                Orbit
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-white/25 p-2 lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => {
              const active =
                item.href === "/orbit"
                  ? pathname === "/orbit"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-white text-[#2f1c6a] shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 lg:hidden"
                onClick={() => setOpen(true)}
              >
                <Menu className="size-4" />
              </button>
              <div>
                <p className="text-[11px] text-slate-500">Super Admin</p>
                <p className="text-sm font-semibold">{adminName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500 sm:inline"
              >
                View site
              </a>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </header>

          <main className="hb-band-cream flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
