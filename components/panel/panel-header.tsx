"use client";

import Link from "next/link";
import { Headphones, Menu, Search } from "lucide-react";

import { BrandMark } from "@/components/auth/brand-mark";
import { LogoutButton } from "@/components/auth/logout-button";
import { routes } from "@/config/routes";
import { panelTitleForPath } from "@/lib/panel/navigation";

type PanelUser = {
  name: string | null;
  email: string;
  image: string | null;
};

type Props = {
  user: PanelUser;
  pathname: string;
  onOpenMobileNav: () => void;
};

export function PanelHeader({ user, pathname, onOpenMobileNav }: Props) {
  const title = panelTitleForPath(pathname);
  const displayName = user.name?.trim() || user.email.split("@")[0];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--hb-p-border)] bg-white/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href={routes.home} className="hidden shrink-0 sm:block">
          <BrandMark className="!h-8 !max-w-[180px]" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-slate-500">Customer area</p>
          <h1 className="font-heading truncate text-base font-semibold text-slate-900 sm:text-lg">
            {title}
          </h1>
        </div>
        <div className="hidden max-w-xs flex-1 md:flex">
          <label className="relative w-full">
            <span className="sr-only">Search services</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              disabled
              placeholder="Search your services (coming soon)"
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-500"
            />
          </label>
        </div>
        <Link
          href={routes.contact}
          className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
        >
          <Headphones className="h-3.5 w-3.5" />
          Support
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="hidden text-right text-xs sm:block"
            title={user.email}
          >
            <p className="font-semibold text-slate-800">{displayName}</p>
            <p className="max-w-[140px] truncate text-slate-500">
              {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
