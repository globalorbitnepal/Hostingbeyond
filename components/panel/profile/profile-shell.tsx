"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, Shield, Sparkles, User, Users } from "lucide-react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: routes.accountProfile, label: "Account information", icon: User },
  {
    href: routes.accountProfileSharing,
    label: "Account sharing",
    icon: Users,
  },
  { href: routes.accountProfileSecurity, label: "Security", icon: Shield },
  {
    href: routes.accountProfileActivity,
    label: "Account activity",
    icon: Activity,
  },
  {
    href: routes.accountProfileNotifications,
    label: "Notification settings",
    icon: Bell,
  },
  {
    href: routes.accountProfileAiMemory,
    label: "AI memory",
    icon: Sparkles,
  },
] as const;

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? routes.accountProfile;

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <nav className="hb-profile-rail" aria-label="Profile">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === routes.accountProfile
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("hb-profile-rail__link", active && "is-active")}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="min-w-0 flex-1 space-y-5 lg:max-w-3xl">{children}</div>
    </div>
  );
}
