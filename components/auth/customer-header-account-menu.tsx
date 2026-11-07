"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { KeyRound, LayoutDashboard, LogOut } from "lucide-react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export type CustomerSessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  hasPassword?: boolean;
};

const MENU_WIDTH = 280;

function computeMenuPosition(trigger: DOMRect): CSSProperties {
  const margin = 8;
  const width = MENU_WIDTH;
  let left = trigger.right - width;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
  return {
    position: "fixed",
    left,
    top: trigger.bottom + margin,
    width,
    zIndex: 3600,
  };
}

function displayName(user: CustomerSessionUser): string {
  const name = user.name?.trim();
  if (name) return name;
  const local = user.email.split("@")[0]?.trim();
  return local || "Account";
}

function userInitials(user: CustomerSessionUser): string {
  const name = displayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function useCustomerSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<CustomerSessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 4000);
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
        signal: ac.signal,
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user?: CustomerSessionUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      clearTimeout(timer);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    setReady(false);
    void refresh();
  }, [pathname, refresh]);

  return { user, ready, setUser, refresh };
}

function PremiumLoginMark({ gradientId }: { gradientId: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={26.5}
      height={26.5}
      className="h-[26.5px] w-[26.5px] shrink-0 drop-shadow-[0_1px_2px_rgba(91,77,255,0.35)]"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="5"
          y1="3"
          x2="19"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7a5cff" />
          <stop offset="0.55" stopColor="#5b4dff" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="8.1"
        r="3.45"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.75"
      />
      <path
        d="M5.15 19.35c.85-3.55 3.45-5.45 6.85-5.45s6 1.9 6.85 5.45"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AccountAvatar({
  user,
  size = 28,
}: {
  user: CustomerSessionUser;
  size?: number;
}) {
  if (user.image?.trim()) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        width={size}
        height={size}
        className="size-full rounded-full object-cover"
      />
    );
  }
  return (
    <span className="text-[11px] font-extrabold tracking-wide text-white">
      {userInitials(user)}
    </span>
  );
}

function AccountMenuLinks({
  user,
  onNavigate,
  onSignOut,
  signingOut,
  className,
}: {
  user: CustomerSessionUser;
  onNavigate?: () => void;
  onSignOut: () => void;
  signingOut: boolean;
  className?: string;
}) {
  const linkClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900";

  return (
    <div className={className}>
      <div className="border-b border-slate-100 px-3 py-3">
        <p className="truncate text-[13px] font-extrabold text-slate-900">
          {displayName(user)}
        </p>
        <p className="truncate text-[12px] font-medium text-slate-500">
          {user.email}
        </p>
      </div>
      <div className="p-1.5">
        <Link href={routes.account} className={linkClass} onClick={onNavigate}>
          <LayoutDashboard className="size-4 shrink-0 text-[#673de6]" />
          My account
        </Link>
        <Link
          href={routes.accountSecurity}
          className={linkClass}
          onClick={onNavigate}
        >
          <KeyRound className="size-4 shrink-0 text-[#673de6]" />
          Change password
        </Link>
        <button
          type="button"
          className={cn(
            linkClass,
            "text-red-700 hover:bg-red-50 hover:text-red-800",
          )}
          disabled={signingOut}
          onClick={() => void onSignOut()}
        >
          <LogOut className="size-4 shrink-0" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function CustomerHeaderAccountMenu({
  loginHref = routes.login,
  loginLabel = "Login",
  variant = "desktop",
  onNavigate,
  className,
}: {
  loginHref?: string;
  loginLabel?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { user, ready, setUser } = useCustomerSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<CSSProperties | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const closeMenu = useCallback(() => setOpen(false), []);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 8) return;
    setMenuPosition(computeMenuPosition(rect));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [open, closeMenu]);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      closeMenu();
      onNavigate?.();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }, [closeMenu, onNavigate, router, setUser]);

  const loginLinkClass =
    variant === "mobile"
      ? "inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-slate-50"
      : "relative -ml-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md transition hover:opacity-90";
  if (!user) {
    return (
      <Link
        href={loginHref}
        aria-label={loginLabel}
        title={loginLabel}
        className={cn(loginLinkClass, className)}
        onClick={onNavigate}
        aria-busy={!ready}
      >
        <PremiumLoginMark
          gradientId={
            variant === "mobile" ? "hb-login-grad-mobile" : "hb-login-grad"
          }
        />
      </Link>
    );
  }

  if (variant === "mobile") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 px-3 py-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#673de6] to-[#2563eb]">
            <AccountAvatar user={user} size={40} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-extrabold text-slate-900">
              {displayName(user)}
            </p>
            <p className="truncate text-[12px] font-medium text-slate-500">
              {user.email}
            </p>
          </div>
        </div>
        <AccountMenuLinks
          user={user}
          onNavigate={onNavigate}
          onSignOut={signOut}
          signingOut={signingOut}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("notranslate relative", className)}
      translate="no"
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName(user)}`}
        title={`${displayName(user)} · ${user.email}`}
        onClick={() => {
          if (open) closeMenu();
          else {
            updateMenuPosition();
            setOpen(true);
          }
        }}
        className={cn(
          "inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-slate-200/90 bg-gradient-to-br from-[#673de6] to-[#2563eb] shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:ring-2 hover:ring-[#673de6]/25",
          open && "ring-2 ring-[#673de6]/30",
        )}
      >
        <AccountAvatar user={user} size={40} />
      </button>

      {open && mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              className="notranslate overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
              translate="no"
              style={
                menuPosition ?? {
                  position: "fixed",
                  top: 80,
                  right: 16,
                  width: MENU_WIDTH,
                  zIndex: 3600,
                }
              }
            >
              <AccountMenuLinks
                user={user}
                onNavigate={() => {
                  closeMenu();
                  onNavigate?.();
                }}
                onSignOut={signOut}
                signingOut={signingOut}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
